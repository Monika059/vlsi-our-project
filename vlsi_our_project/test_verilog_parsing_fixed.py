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
        
        # Split the ports string into individual port declarations
        port_declarations = []
        current_decl = ""
        in_parens = 0
        
        for char in ports:
            if char == '(':
                in_parens += 1
                current_decl += char
            elif char == ')':
                in_parens -= 1
                current_decl += char
            elif char == ',' and in_parens == 0:
                port_declarations.append(current_decl.strip())
                current_decl = ""
            else:
                current_decl += char
        
        if current_decl:
            port_declarations.append(current_decl.strip())
        
        print(f"  Port declarations: {port_declarations}")
        
        for decl in port_declarations:
            decl = decl.strip()
            if not decl:
                continue
                
            if decl.startswith('input'):
                sigs = decl[5:].strip()  # Remove 'input' keyword
                sigs = [s.strip() for s in sigs.split(',')]
                for sig in sigs:
                    sig = re.sub(r'\b(wire|reg)\b', '', sig).strip()
                    if sig and sig not in seen_signals and not sig.startswith('['):
                        inputs.append(sig)
                        seen_signals.add(sig)
            elif decl.startswith('output'):
                sigs = decl[6:].strip()  # Remove 'output' keyword
                sigs = [s.strip() for s in sigs.split(',')]
                for sig in sigs:
                    sig = re.sub(r'\b(wire|reg)\b', '', sig).strip()
                    if sig and sig not in seen_signals and not sig.startswith('['):
                        outputs.append(sig)
                        seen_signals.add(sig)
        
        print(f"  Inputs: {inputs}")
        print(f"  Outputs: {outputs}")

if __name__ == '__main__':
    test_verilog_parsing()
