import re

def test_verilog_parsing():
    # Test with different Verilog module declarations
    test_cases = [
        'module and_gate(input a, b, output y); assign y = a & b; endmodule',
        'module or_gate(input a, b, output y); assign y = a | b; endmodule',
        'module not_gate(input a, output y); assign y = ~a; endmodule',
        'module test(input a, b, output y, z); assign y = a & b; assign z = a | b; endmodule',
        'module mixed(input a, b, output y, input c, output z); assign y = a & b; assign z = c; endmodule'
    ]
    
    for code in test_cases:
        print(f"\nTesting: {code}")
        
        # Extract ports section
        module_match = re.search(r'module\s+\w+\s*\((.*?)\);', code, re.DOTALL)
        if not module_match:
            print("  No module found")
            continue
            
        ports = module_match.group(1)
        print(f"  Ports: {ports}")
        
        # Extract inputs and outputs
        inputs = []
        outputs = []
        seen_signals = set()
        
        # Handle input declarations
        input_matches = re.finditer(r'input\s+([^;]+)', ports)
        for match in input_matches:
            signals = [s.strip() for s in match.group(1).split(',')]
            for sig in signals:
                sig = re.sub(r'\b(wire|reg)\b', '', sig).strip()
                if sig and sig not in seen_signals and not sig.startswith('[') and 'output' not in sig.lower():
                    inputs.append(sig)
                    seen_signals.add(sig)
        
        # Handle output declarations
        output_matches = re.finditer(r'output\s+([^;]+)', ports)
        for match in output_matches:
            signals = [s.strip() for s in match.group(1).split(',')]
            for sig in signals:
                sig = re.sub(r'\b(wire|reg)\b', '', sig).strip()
                if sig and sig not in seen_signals and not sig.startswith('[') and 'input' not in sig.lower():
                    outputs.append(sig)
                    seen_signals.add(sig)
        
        print(f"  Inputs: {inputs}")
        print(f"  Outputs: {outputs}")

if __name__ == '__main__':
    test_verilog_parsing()
