import re

# Test the FIXED signal extraction logic from _mock_simulation
def test_fixed_mock_simulation_extraction(code):
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
                # Only add if it doesn't contain 'output' (to avoid confusion with mixed declarations)
                if sig and sig not in seen_signals and not sig.startswith('[') and 'output' not in sig.lower():
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
                # Only add if it doesn't contain 'input' (to avoid confusion with mixed declarations)
                if sig and sig not in seen_signals and not sig.startswith('[') and 'input' not in sig.lower():
                    outputs.append(sig)
                    signals.append({'name': sig, 'direction': 'output'})
                    seen_signals.add(sig)

    print(f"FIXED Mock simulation extraction: inputs={inputs}, outputs={outputs}, signals={[s['name'] for s in signals]}")

# Test with AND gate code
code = 'module and_gate(input a, b, output y); assign y = a & b; endmodule'

print("Testing FIXED signal extraction with:", repr(code))
print()

test_fixed_mock_simulation_extraction(code)
