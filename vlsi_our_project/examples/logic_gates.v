// Basic Logic Gates - XOR, XNOR, NAND, NOR
// Demonstrates fundamental digital logic operations

// XOR Gate
module xor_gate(
    input a,
    input b,
    output y
);
    // XOR: Output is 1 when inputs are different
    assign y = a ^ b;
endmodule

// XNOR Gate
module xnor_gate(
    input a,
    input b,
    output y
);
    // XNOR: Output is 1 when inputs are same (complement of XOR)
    assign y = ~(a ^ b);
    // Alternative: assign y = a ~^ b;
endmodule

// NAND Gate
module nand_gate(
    input a,
    input b,
    output y
);
    // NAND: Output is 0 only when both inputs are 1
    assign y = ~(a & b);
endmodule

// NOR Gate
module nor_gate(
    input a,
    input b,
    output y
);
    // NOR: Output is 1 only when both inputs are 0
    assign y = ~(a | b);
endmodule

// Testbench for XOR Gate
module xor_gate_tb;
    reg a, b;
    wire y;
    
    // Instantiate XOR gate
    xor_gate uut (
        .a(a),
        .b(b),
        .y(y)
    );
    
    initial begin
        $display("XOR Gate Truth Table");
        $display("A B | Y");
        $display("----|---");
        
        // Test all 4 combinations
        a = 0; b = 0; #10;
        $display("%b %b | %b", a, b, y);
        
        a = 0; b = 1; #10;
        $display("%b %b | %b", a, b, y);
        
        a = 1; b = 0; #10;
        $display("%b %b | %b", a, b, y);
        
        a = 1; b = 1; #10;
        $display("%b %b | %b", a, b, y);
        
        $finish;
    end
    
    // Generate VCD file for waveform viewing
    initial begin
        $dumpfile("xor_gate.vcd");
        $dumpvars(0, xor_gate_tb);
    end
endmodule

// Testbench for XNOR Gate
module xnor_gate_tb;
    reg a, b;
    wire y;
    
    // Instantiate XNOR gate
    xnor_gate uut (
        .a(a),
        .b(b),
        .y(y)
    );
    
    initial begin
        $display("XNOR Gate Truth Table");
        $display("A B | Y");
        $display("----|---");
        
        // Test all 4 combinations
        a = 0; b = 0; #10;
        $display("%b %b | %b", a, b, y);
        
        a = 0; b = 1; #10;
        $display("%b %b | %b", a, b, y);
        
        a = 1; b = 0; #10;
        $display("%b %b | %b", a, b, y);
        
        a = 1; b = 1; #10;
        $display("%b %b | %b", a, b, y);
        
        $finish;
    end
    
    // Generate VCD file for waveform viewing
    initial begin
        $dumpfile("xnor_gate.vcd");
        $dumpvars(0, xnor_gate_tb);
    end
endmodule

// Testbench for NAND Gate
module nand_gate_tb;
    reg a, b;
    wire y;
    
    // Instantiate NAND gate
    nand_gate uut (
        .a(a),
        .b(b),
        .y(y)
    );
    
    initial begin
        $display("NAND Gate Truth Table");
        $display("A B | Y");
        $display("----|---");
        
        // Test all 4 combinations
        a = 0; b = 0; #10;
        $display("%b %b | %b", a, b, y);
        
        a = 0; b = 1; #10;
        $display("%b %b | %b", a, b, y);
        
        a = 1; b = 0; #10;
        $display("%b %b | %b", a, b, y);
        
        a = 1; b = 1; #10;
        $display("%b %b | %b", a, b, y);
        
        $finish;
    end
    
    // Generate VCD file for waveform viewing
    initial begin
        $dumpfile("nand_gate.vcd");
        $dumpvars(0, nand_gate_tb);
    end
endmodule

// Testbench for NOR Gate
module nor_gate_tb;
    reg a, b;
    wire y;
    
    // Instantiate NOR gate
    nor_gate uut (
        .a(a),
        .b(b),
        .y(y)
    );
    
    initial begin
        $display("NOR Gate Truth Table");
        $display("A B | Y");
        $display("----|---");
        
        // Test all 4 combinations
        a = 0; b = 0; #10;
        $display("%b %b | %b", a, b, y);
        
        a = 0; b = 1; #10;
        $display("%b %b | %b", a, b, y);
        
        a = 1; b = 0; #10;
        $display("%b %b | %b", a, b, y);
        
        a = 1; b = 1; #10;
        $display("%b %b | %b", a, b, y);
        
        $finish;
    end
    
    // Generate VCD file for waveform viewing
    initial begin
        $dumpfile("nor_gate.vcd");
        $dumpvars(0, nor_gate_tb);
    end
endmodule
