import re
from typing import Dict, List, Any

class VerilogParser:
    """
    Verilog code parser for syntax checking and basic analysis
    """
    
    def __init__(self):
        self.keywords = {
            'module', 'endmodule', 'input', 'output', 'inout', 'wire', 'reg',
            'always', 'assign', 'begin', 'end', 'if', 'else', 'case', 'endcase',
            'for', 'while', 'posedge', 'negedge', 'parameter', 'localparam',
            'function', 'endfunction', 'task', 'endtask', 'initial', 'generate',
            'endgenerate', 'genvar', 'integer', 'real', 'time'
        }
        
    def parse(self, code: str) -> Dict[str, Any]:
        """
        Parse Verilog code and return analysis results
        """
        result = {
            "errors": [],
            "warnings": [],
            "modules": [],
            "signals": [],
            "statistics": {}
        }
        
        # Check for basic syntax errors
        result["errors"].extend(self._check_syntax_errors(code))
        
        # Check for common warnings
        result["warnings"].extend(self._check_warnings(code))
        
        # Extract module information
        result["modules"] = self._extract_modules(code)
        
        # Extract signal declarations
        result["signals"] = self._extract_signals(code)
        
        # Calculate statistics
        result["statistics"] = self._calculate_statistics(code)
        
        return result
    
    def _check_syntax_errors(self, code: str) -> List[Dict[str, Any]]:
        """Check for common syntax errors"""
        errors = []
        lines = code.split('\n')
        
        # Check for balanced begin/end
        begin_count = code.count('begin')
        end_count = code.count('end') - code.count('endmodule') - code.count('endcase') - code.count('endfunction') - code.count('endtask')
        
        if begin_count != end_count:
            errors.append({
                "type": "syntax",
                "severity": "error",
                "message": f"Unbalanced begin/end blocks: {begin_count} begin vs {end_count} end",
                "line": 0
            })
        
        # Check for balanced module/endmodule
        module_count = len(re.findall(r'\bmodule\s+\w+', code))
        endmodule_count = code.count('endmodule')
        
        if module_count != endmodule_count:
            errors.append({
                "type": "syntax",
                "severity": "error",
                "message": f"Unbalanced module/endmodule: {module_count} module vs {endmodule_count} endmodule",
                "line": 0
            })
        
        # Check for missing semicolons (basic check)
        in_module_header = False

        for i, line in enumerate(lines, 1):
            stripped = line.strip()
            if stripped and not stripped.startswith('//'):
                # Track module port declarations to avoid false semicolon errors
                if stripped.startswith('module'):
                    in_module_header = ');' not in stripped
                    continue

                if in_module_header:
                    if ');' in stripped:
                        in_module_header = False
                    continue

                # Remove inline comments before semicolon check
                code_part = stripped.split('//')[0]
                code_part = re.split(r'/\*', code_part)[0].rstrip()
                if not code_part:
                    continue

                # Lines that should end with semicolon
                if any(code_part.startswith(kw) for kw in ['assign', 'wire', 'reg', 'input', 'output', 'parameter']):
                    if not code_part.endswith(';') and not code_part.endswith(','):
                        errors.append({
                            "type": "syntax",
                            "severity": "error",
                            "message": "Missing semicolon",
                            "line": i,
                            "column": len(code_part)
                        })
        
        # Check for unmatched parentheses
        paren_stack = []
        for i, line in enumerate(lines, 1):
            for j, char in enumerate(line):
                if char == '(':
                    paren_stack.append((i, j))
                elif char == ')':
                    if not paren_stack:
                        errors.append({
                            "type": "syntax",
                            "severity": "error",
                            "message": "Unmatched closing parenthesis",
                            "line": i,
                            "column": j
                        })
                    else:
                        paren_stack.pop()
        
        if paren_stack:
            line, col = paren_stack[-1]
            errors.append({
                "type": "syntax",
                "severity": "error",
                "message": "Unmatched opening parenthesis",
                "line": line,
                "column": col
            })
        
        return errors
    
    def _check_warnings(self, code: str) -> List[Dict[str, Any]]:
        """Check for common warnings and best practice violations"""
        warnings = []
        lines = code.split('\n')
        
        # Check for blocking assignments in sequential logic
        in_always_block = False
        always_type = None
        
        for i, line in enumerate(lines, 1):
            stripped = line.strip()
            
            # Detect always blocks
            if 'always' in stripped:
                in_always_block = True
                if 'posedge' in stripped or 'negedge' in stripped:
                    always_type = 'sequential'
                else:
                    always_type = 'combinational'
            
            if in_always_block and always_type == 'sequential':
                if '=' in stripped and '<=' not in stripped and 'assign' not in stripped:
                    # Check if it's actually an assignment (not comparison)
                    if re.search(r'\w+\s*=\s*', stripped) and '==' not in stripped:
                        warnings.append({
                            "type": "best_practice",
                            "severity": "warning",
                            "message": "Blocking assignment (=) in sequential logic. Consider using non-blocking (<=)",
                            "line": i
                        })
            
            if 'end' in stripped:
                in_always_block = False
                always_type = None
            
            # Check for inferred latches
            if always_type == 'combinational' and 'if' in stripped:
                # Simple check - would need more sophisticated analysis
                warnings.append({
                    "type": "best_practice",
                    "severity": "warning",
                    "message": "Potential inferred latch. Ensure all cases are covered in combinational logic",
                    "line": i
                })
        
        # Check for unused signals (basic check)
        declared_signals = self._extract_signals(code)
        for signal in declared_signals:
            signal_name = signal['name']
            # Count occurrences (excluding declaration)
            occurrences = len(re.findall(r'\b' + signal_name + r'\b', code))
            if occurrences <= 1:  # Only declaration
                warnings.append({
                    "type": "unused",
                    "severity": "warning",
                    "message": f"Signal '{signal_name}' may be unused",
                    "line": signal.get('line', 0)
                })
        
        return warnings
    
    def _extract_modules(self, code: str) -> List[Dict[str, Any]]:
        """Extract module definitions"""
        modules = []
        
        # Find all module declarations
        module_pattern = r'module\s+(\w+)\s*(?:#\s*\([^)]*\))?\s*\(([^;]*)\);'
        matches = re.finditer(module_pattern, code, re.DOTALL)
        
        for match in matches:
            module_name = match.group(1)
            ports_str = match.group(2)
            
            modules.append({
                "name": module_name,
                "ports": self._parse_ports(ports_str),
                "start_pos": match.start(),
                "end_pos": match.end()
            })
        
        return modules
    
    def _parse_ports(self, ports_str: str) -> List[Dict[str, str]]:
        """Parse module ports"""
        ports = []
        
        # Split by comma and analyze each port
        port_list = [p.strip() for p in ports_str.split(',')]
        
        for port in port_list:
            if not port:
                continue
            
            # Extract port information
            port_info = {"name": port}
            
            # Check for direction keywords
            if 'input' in port:
                port_info['direction'] = 'input'
            elif 'output' in port:
                port_info['direction'] = 'output'
            elif 'inout' in port:
                port_info['direction'] = 'inout'
            
            # Extract port name (last word)
            words = port.split()
            if words:
                port_info['name'] = words[-1]
            
            ports.append(port_info)
        
        return ports
    
    def _extract_signals(self, code: str) -> List[Dict[str, Any]]:
        """Extract signal declarations"""
        signals = []
        
        # Pattern for wire/reg declarations
        signal_pattern = r'(wire|reg|input|output|inout)\s+(?:\[([^\]]+)\])?\s*(\w+)'
        matches = re.finditer(signal_pattern, code)
        
        for match in matches:
            signal_type = match.group(1)
            bit_range = match.group(2)
            signal_name = match.group(3)
            
            signals.append({
                "type": signal_type,
                "name": signal_name,
                "width": bit_range if bit_range else "1",
                "line": code[:match.start()].count('\n') + 1
            })
        
        return signals
    
    def _calculate_statistics(self, code: str) -> Dict[str, int]:
        """Calculate code statistics"""
        lines = code.split('\n')
        
        return {
            "total_lines": len(lines),
            "code_lines": len([l for l in lines if l.strip() and not l.strip().startswith('//')]),
            "comment_lines": len([l for l in lines if l.strip().startswith('//')]),
            "blank_lines": len([l for l in lines if not l.strip()]),
            "module_count": len(re.findall(r'\bmodule\s+\w+', code)),
            "always_blocks": code.count('always'),
            "assign_statements": code.count('assign')
        }
