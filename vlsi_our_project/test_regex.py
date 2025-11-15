import re

code = 'module and_gate(input a, b, output y); assign y = a & b; endmodule'
module_match = re.search(r'module\s+\w+\s*\((.*?)\);', code, re.DOTALL)

if module_match:
    ports = module_match.group(1)
    print('Ports:', repr(ports))

    output_match = re.search(r'output\s+([^;]+)', ports)
    if output_match:
        print('Output match:', repr(output_match.group(1)))
        output_signals = [s.strip() for s in output_match.group(1).split(',')]
        print('Output signals:', output_signals)

        # Check for any 'output_y' patterns
        if 'output_y' in ports:
            print('Found output_y in ports!')
        else:
            print('No output_y found in ports')
