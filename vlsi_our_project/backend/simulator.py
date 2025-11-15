import os
import re
import shutil
import subprocess
import tempfile
import uuid
from typing import Any, Dict, List, Optional, Tuple


class VerilogSimulator:
    """Wrapper for Verilog simulation using Icarus Verilog."""

    def __init__(self) -> None:
        self.iverilog_path = os.getenv("IVERILOG_PATH", "iverilog")
        self.vvp_path = os.getenv("VVP_PATH", "vvp")

    def simulate(
        self,
        design_code: str,
        testbench_code: str = "",
        persist_waveform_dir: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Run the HDL simulation and optionally persist the waveform file."""

        if not self._check_iverilog_available():
            return self._mock_simulation(design_code, testbench_code, persist_waveform_dir)

        try:
            with tempfile.TemporaryDirectory() as tmpdir:
                design_file = os.path.join(tmpdir, "design.v")
                testbench_file = os.path.join(tmpdir, "testbench.v")
                vcd_file = os.path.join(tmpdir, "waveform.vcd")
                compiled_file = os.path.join(tmpdir, "compiled.vvp")

                with open(design_file, "w", encoding="utf-8") as design_handle:
                    design_handle.write(design_code)

                if testbench_code:
                    with open(testbench_file, "w", encoding="utf-8") as tb_handle:
                        tb_handle.write(testbench_code)
                else:
                    auto_testbench = self._generate_basic_testbench(design_code, vcd_file)
                    with open(testbench_file, "w", encoding="utf-8") as tb_handle:
                        tb_handle.write(auto_testbench)

                compile_result = subprocess.run(
                    [self.iverilog_path, "-o", compiled_file, design_file, testbench_file],
                    capture_output=True,
                    text=True,
                    timeout=10,
                )
                if compile_result.returncode != 0:
                    return {
                        "success": False,
                        "error": f"Compilation error: {compile_result.stderr}",
                    }

                sim_result = subprocess.run(
                    [self.vvp_path, compiled_file],
                    capture_output=True,
                    text=True,
                    timeout=10,
                )
                if sim_result.returncode != 0:
                    return {
                        "success": False,
                        "error": f"Simulation error: {sim_result.stderr}",
                    }

                waveform_data: List[Dict[str, Any]] = []
                signals: List[Dict[str, Any]] = []
                persisted: Optional[Tuple[str, str]] = None

                if os.path.exists(vcd_file):
                    waveform_data, signals = self._parse_vcd(vcd_file)
                    if persist_waveform_dir:
                        persisted = self._persist_waveform(vcd_file, persist_waveform_dir)

                response: Dict[str, Any] = {
                    "success": True,
                    "waveform_data": waveform_data,
                    "signals": signals,
                    "log": sim_result.stdout,
                }

                if persisted:
                    response["waveform_file"], response["waveform_url"] = persisted

                return response

        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "error": "Simulation timeout - possible infinite loop",
            }
        except Exception as exc:  # noqa: BLE001
            return {
                "success": False,
                "error": f"Simulation error: {exc}",
            }

    def _check_iverilog_available(self) -> bool:
        try:
            result = subprocess.run(
                [self.iverilog_path, "-v"],
                capture_output=True,
                text=True,
                timeout=5,
            )
            return result.returncode == 0
        except Exception:  # noqa: BLE001
            return False

    def _generate_basic_testbench(self, design_code: str, vcd_file: str) -> str:
        module_match = re.search(r"module\s+(\w+)\s*\(([^)]+)\)", design_code, re.DOTALL)
        if not module_match:
            return ""

        module_name = module_match.group(1)
        ports_str = module_match.group(2)

        inputs: List[str] = []
        outputs: List[str] = []
        for segment in ports_str.split(","):
            token = segment.strip()
            if "input" in token:
                match = re.search(r"(\w+)\s*$", token)
                if match:
                    inputs.append(match.group(1))
            elif "output" in token:
                match = re.search(r"(\w+)\s*$", token)
                if match:
                    outputs.append(match.group(1))

        port_lines = [f"        .{name}({name})" for name in [*inputs, *outputs]]

        lines = [
            "module testbench;",
            "    // Inputs",
        ]
        lines.extend([f"    reg {name};" for name in inputs])
        lines.append("")
        lines.append("    // Outputs")
        lines.extend([f"    wire {name};" for name in outputs])
        lines.extend(
            [
                "",
                "    // Instantiate the module",
                f"    {module_name} uut (",
                ",\n".join(port_lines),
                "    );",
                "",
                "    initial begin",
                "        // Initialize VCD dump",
                f"        $dumpfile(\"{vcd_file}\");",
                "        $dumpvars(0, testbench);",
                "",
                "        // Initialize inputs",
            ]
        )
        lines.extend([f"        {name} = 0;" for name in inputs])
        lines.extend(
            [
                "",
                "        // Test cases",
                "        #10;",
            ]
        )

        for value in range(min(4, 2 ** len(inputs))):
            for bit, name in enumerate(inputs):
                lines.append(f"        {name} = {(value >> bit) & 1};")
            lines.append("        #10;")

        monitor_items = [f"{name}=%b" for name in inputs + outputs]
        monitor_signature = " ".join(monitor_items)
        monitor_signals = ", ".join(["$time", *inputs, *outputs])

        lines.extend(
            [
                "",
                "        // Finish simulation",
                "        #10;",
                "        $finish;",
                "    end",
                "",
                "    // Monitor outputs",
                "    initial begin",
                f"        $monitor(\"Time=%0t: {monitor_signature}\", {monitor_signals});",
                "    end",
                "endmodule",
                "",
            ]
        )

        return "\n".join(lines)

    def _parse_vcd(self, vcd_file: str) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        waveform_data: List[Dict[str, Any]] = []
        signals: List[Dict[str, Any]] = []
        signal_map: Dict[str, str] = {}
        current_time = 0

        try:
            with open(vcd_file, "r", encoding="utf-8") as handle:
                lines = handle.readlines()

            in_var_section = False
            for line in lines:
                if "$var" in line:
                    in_var_section = True
                    parts = line.split()
                    if len(parts) >= 5:
                        signal_id = parts[3]
                        signal_name = parts[4]
                        signal_map[signal_id] = signal_name
                        if all(signal_name != entry["name"] for entry in signals):
                            signals.append({"name": signal_name, "id": signal_id})
                elif "$enddefinitions" in line:
                    in_var_section = False

            time_data: Dict[int, Dict[str, str]] = {}
            for raw_line in lines:
                stripped = raw_line.strip()
                if not stripped:
                    continue

                if stripped.startswith("#"):
                    current_time = int(stripped[1:])
                    time_data.setdefault(current_time, {})
                elif len(stripped) >= 2:
                    value = stripped[0]
                    signal_id = stripped[1:]
                    if signal_id in signal_map:
                        time_data.setdefault(current_time, {})[signal_map[signal_id]] = value

            for timestamp in sorted(time_data):
                data_point: Dict[str, Any] = {"time": timestamp}
                data_point.update(time_data[timestamp])
                waveform_data.append(data_point)

        except Exception as exc:  # noqa: BLE001
            print(f"VCD parsing error: {exc}")

        return waveform_data, signals

    def _persist_waveform(self, source_vcd: str, target_dir: str) -> Optional[Tuple[str, str]]:
        try:
            os.makedirs(target_dir, exist_ok=True)
            filename = f"waveform_{uuid.uuid4().hex}.vcd"
            destination = os.path.join(target_dir, filename)
            shutil.copyfile(source_vcd, destination)
            return filename, f"/uploads/{filename}"
        except Exception as exc:  # noqa: BLE001
            print(f"Waveform persistence error: {exc}")
            return None

    def _persist_mock_waveform(
        self,
        waveform_data: List[Dict[str, Any]],
        signals: List[Dict[str, Any]],
        target_dir: Optional[str],
    ) -> Optional[Tuple[str, str]]:
        if not target_dir or not waveform_data or not signals:
            return None

        try:
            os.makedirs(target_dir, exist_ok=True)
            filename = f"waveform_{uuid.uuid4().hex}.vcd"
            destination = os.path.join(target_dir, filename)

            symbols: Dict[str, str] = {}
            base_char_code = 33
            for idx, signal in enumerate(signals):
                name = signal.get("name") or f"signal_{idx}"
                symbols[name] = chr(base_char_code + (idx % 94))

            with open(destination, "w", encoding="utf-8") as handle:
                handle.write("$date\n    Generated by mock simulator\n$end\n")
                handle.write("$version\n    Mock VCD\n$end\n")
                handle.write("$timescale 1ns $end\n")
                handle.write("$scope module mock $end\n")
                for name, symbol in symbols.items():
                    handle.write(f"$var wire 1 {symbol} {name} $end\n")
                handle.write("$upscope $end\n$enddefinitions $end\n")

                last_values = {name: "0" for name in symbols}
                for point in waveform_data:
                    handle.write(f"#{int(point.get('time', 0))}\n")
                    for name, symbol in symbols.items():
                        value = str(point.get(name, last_values[name]))
                        last_values[name] = value
                        handle.write(f"{value}{symbol}\n")

            return filename, f"/uploads/{filename}"
        except Exception as exc:  # noqa: BLE001
            print(f"Mock waveform persistence error: {exc}")
            return None

    def _mock_simulation(
        self,
        design_code: str,
        testbench_code: str,
        persist_waveform_dir: Optional[str] = None,
    ) -> Dict[str, Any]:
        signals: List[Dict[str, Any]] = []
        inputs: List[str] = []
        outputs: List[str] = []
        seen_signals: set[str] = set()

        module_match = re.search(r"module\s+\w+\s*\((.*?)\);", design_code, re.DOTALL)
        if module_match:
            ports = module_match.group(1)

            input_match = re.search(r"input\s+([^;]+)", ports)
            if input_match:
                for raw in input_match.group(1).split(","):
                    cleaned = re.sub(r"\b(wire|reg)\b", "", raw).strip()
                    if cleaned and cleaned not in seen_signals and "output" not in cleaned.lower():
                        inputs.append(cleaned)
                        signals.append({"name": cleaned, "direction": "input"})
                        seen_signals.add(cleaned)

            output_match = re.search(r"output\s+([^;]+)", ports)
            if output_match:
                for raw in output_match.group(1).split(","):
                    cleaned = re.sub(r"\b(wire|reg)\b", "", raw).strip()
                    if cleaned and cleaned not in seen_signals and "input" not in cleaned.lower():
                        outputs.append(cleaned)
                        signals.append({"name": cleaned, "direction": "output"})
                        seen_signals.add(cleaned)

        circuit_type = self._detect_circuit_type(design_code)
        waveform_data: List[Dict[str, Any]] = []

        if len(inputs) == 2:
            test_vectors = [(0, 0), (0, 1), (1, 0), (1, 1)]
            for index, (a_val, b_val) in enumerate(test_vectors):
                point = {"time": index * 10, inputs[0]: str(a_val), inputs[1]: str(b_val)}
                if circuit_type == "half_adder" and len(outputs) >= 2:
                    point[outputs[0]] = str(a_val ^ b_val)
                    point[outputs[1]] = str(a_val & b_val)
                else:
                    result = self._calculate_output(circuit_type, a_val, b_val)
                    if outputs:
                        point[outputs[0]] = str(result)
                        for extra in outputs[1:]:
                            point[extra] = "0"
                waveform_data.append(point)

        elif len(inputs) == 1:
            for index, value in enumerate([0, 1]):
                point = {"time": index * 10, inputs[0]: str(value)}
                result = 1 - value if "not" in circuit_type else value
                if outputs:
                    point[outputs[0]] = str(result)
                    for extra in outputs[1:]:
                        point[extra] = "0"
                waveform_data.append(point)

        elif len(inputs) == 3:
            for idx in range(8):
                a_val = (idx >> 0) & 1
                b_val = (idx >> 1) & 1
                c_val = (idx >> 2) & 1
                point = {
                    "time": idx * 10,
                    inputs[0]: str(a_val),
                    inputs[1]: str(b_val),
                    inputs[2]: str(c_val),
                }
                if "full_adder" in circuit_type or "adder" in circuit_type:
                    sum_val = a_val ^ b_val ^ c_val
                    carry_val = (a_val & b_val) | (b_val & c_val) | (a_val & c_val)
                    if outputs:
                        point[outputs[0]] = str(sum_val)
                        if len(outputs) > 1:
                            point[outputs[1]] = str(carry_val)
                        for extra in outputs[2:]:
                            point[extra] = "0"
                else:
                    result = self._calculate_output(circuit_type, a_val, b_val, c_val)
                    if outputs:
                        point[outputs[0]] = str(result)
                        for extra in outputs[1:]:
                            point[extra] = "0"
                waveform_data.append(point)

        unique_signals: List[Dict[str, Any]] = []
        seen_names: set[str] = set()
        for signal in signals:
            name = signal.get("name")
            if name and name not in seen_names:
                unique_signals.append(signal)
                seen_names.add(name)

        persisted = self._persist_mock_waveform(waveform_data, unique_signals, persist_waveform_dir)

        response: Dict[str, Any] = {
            "success": True,
            "waveform_data": waveform_data,
            "signals": unique_signals,
            "log": "Simulation completed successfully with mock data.",
        }
        if persisted:
            response["waveform_file"], response["waveform_url"] = persisted

        return response

    def _detect_circuit_type(self, code: str) -> str:
        lowered = code.lower()
        if "full_adder" in lowered:
            return "full_adder"
        if "half_adder" in lowered:
            return "half_adder"
        if "xnor_gate" in lowered or "xnor" in lowered:
            return "xnor"
        if "xor_gate" in lowered or "xor" in lowered:
            return "xor"
        if "nand_gate" in lowered or "nand" in lowered:
            return "nand"
        if "nor_gate" in lowered or "nor" in lowered:
            return "nor"
        if "and_gate" in lowered or ("a & b" in lowered and "~" not in lowered):
            return "and"
        if "or_gate" in lowered or ("a | b" in lowered and "~" not in lowered):
            return "or"
        if "not_gate" in lowered or "~a" in lowered:
            return "not"
        return "unknown"

    def _calculate_output(self, circuit_type: str, a: int, b: int, c: int = 0) -> int:
        if circuit_type == "and":
            return a & b
        if circuit_type == "or":
            return a | b
        if circuit_type == "nand":
            return 1 - (a & b)
        if circuit_type == "nor":
            return 1 - (a | b)
        if circuit_type == "xor":
            return a ^ b
        if circuit_type == "xnor":
            return 1 - (a ^ b)
        if circuit_type == "not":
            return 1 - a
        if circuit_type == "half_adder":
            return a ^ b
        if circuit_type == "full_adder":
            return a ^ b ^ c
        return 0
