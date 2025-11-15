import re

# Test the signal extraction logic from _mock_simulation
def test_mock_simulation_extraction(code):
    signals = []
    inputs = []
    outputs = []
    seen_signals = set()

    module_match = re.search(r'module\s+\w+\s*\((.*?)\);', code, re.DOTALL)

    if module_match:
        ports = module_match.group(1)

        # Extract inputs - handle comma-separated and individual declarations
        input_match = re.search(r'input\s+([^;]+)', ports)
        if input_match:
            input_signals = [s.strip() for s in input_match.group(1).split(',')]
            for sig in input_signals:
                # Remove any type keywords like 'wire', 'reg', etc.
                sig = re.sub(r'\b(wire|reg)\b', '', sig).strip()
                if sig and sig not in seen_signals and not sig.startswith('['):
                    inputs.append(sig)
                    signals.append({'name': sig, 'direction': 'input'})
                    seen_signals.add(sig)

        # Extract outputs - handle comma-separated and individual declarations
        output_match = re.search(r'output\s+([^;]+)', ports)
        if output_match:
            output_signals = [s.strip() for s in output_match.group(1).split(',')]
            for sig in output_signals:
                # Remove any type keywords like 'wire', 'reg', etc.
                sig = re.sub(r'\b(wire|reg)\b', '', sig).strip()
                if sig and sig not in seen_signals and not sig.startswith('['):
                    outputs.append(sig)
                    signals.append({'name': sig, 'direction': 'output'})
                    seen_signals.add(sig)

    print(f"Mock simulation extraction: inputs={inputs}, outputs={outputs}, signals={signals}")

# Test the signal extraction logic from _generate_basic_testbench
def test_testbench_extraction(code):
    module_match = re.search(r'module\s+(\w+)\s*\(([^)]+)\)', code, re.DOTALL)

    if not module_match:
        return

    module_name = module_match.group(1)
    ports_str = module_match.group(2)

    # Parse ports
    inputs = []
    outputs = []

    for line in ports_str.split(','):
        line = line.strip()
        if 'input' in line:
            # Extract signal name
            match = re.search(r'(\w+)\s*$', line)
            if match:
                inputs.append(match.group(1))
        elif 'output' in line:
            match = re.search(r'(\w+)\s*$', line)
            if match:
                outputs.append(match.group(1))

    print(f"Testbench extraction: inputs={inputs}, outputs={outputs}")

# Test with AND gate code
code = 'module and_gate(input a, b, output y); assign y = a & b; endmodule'

print("Testing signal extraction with:", repr(code))
print()

test_mock_simulation_extraction(code)
test_testbench_extraction(code)
