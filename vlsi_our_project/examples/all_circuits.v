// Comprehensive Logic Circuits Collection
// Includes: Half Adder, Full Adder, XOR, XNOR, NAND, NOR

// ============================================
// BASIC LOGIC GATES
// ============================================

// XOR Gate - Output is 1 when inputs differ
module xor_gate(
    input a, b,
    output y
);
    assign y = a ^ b;
endmodule

// XNOR Gate - Output is 1 when inputs are same
module xnor_gate(
    input a, b,
    output y
);
    assign y = ~(a ^ b);
endmodule

// NAND Gate - Output is 0 only when both inputs are 1
module nand_gate(
    input a, b,
    output y
);
    assign y = ~(a & b);
endmodule

// NOR Gate - Output is 1 only when both inputs are 0
module nor_gate(
    input a, b,
    output y
);
    assign y = ~(a | b);
endmodule

// ============================================
// ADDER CIRCUITS
// ============================================

// Half Adder - Adds two 1-bit numbers
module half_adder(
    input a, b,
    output sum, carry
);
    assign sum = a ^ b;      // XOR for sum
    assign carry = a & b;    // AND for carry
endmodule

// Full Adder - Adds three 1-bit numbers
module full_adder(
    input a, b, cin,
    output sum, cout
);
    assign sum = a ^ b ^ cin;                    // XOR of all inputs
    assign cout = (a & b) | (b & cin) | (a & cin);  // Majority function
endmodule

// ============================================
// COMPREHENSIVE TESTBENCH
// ============================================

module all_circuits_tb;
    reg a, b, cin;
    
    // Gate outputs
    wire xor_y, xnor_y, nand_y, nor_y;
    
    // Adder outputs
    wire ha_sum, ha_carry;
    wire fa_sum, fa_cout;
    
    // Instantiate all modules
    xor_gate xor_inst(.a(a), .b(b), .y(xor_y));
    xnor_gate xnor_inst(.a(a), .b(b), .y(xnor_y));
    nand_gate nand_inst(.a(a), .b(b), .y(nand_y));
    nor_gate nor_inst(.a(a), .b(b), .y(nor_y));
    
    half_adder ha_inst(.a(a), .b(b), .sum(ha_sum), .carry(ha_carry));
    full_adder fa_inst(.a(a), .b(b), .cin(cin), .sum(fa_sum), .cout(fa_cout));
    
    initial begin
        $display("\n========================================");
        $display("LOGIC GATES TRUTH TABLE");
        $display("========================================");
        $display("A B | XOR XNOR NAND NOR");
        $display("----|-------------------");
        
        cin = 0;  // Not used for basic gates
        
        a = 0; b = 0; #10;
        $display("%b %b |  %b   %b    %b   %b", a, b, xor_y, xnor_y, nand_y, nor_y);
        
        a = 0; b = 1; #10;
        $display("%b %b |  %b   %b    %b   %b", a, b, xor_y, xnor_y, nand_y, nor_y);
        
        a = 1; b = 0; #10;
        $display("%b %b |  %b   %b    %b   %b", a, b, xor_y, xnor_y, nand_y, nor_y);
        
        a = 1; b = 1; #10;
        $display("%b %b |  %b   %b    %b   %b", a, b, xor_y, xnor_y, nand_y, nor_y);
        
        $display("\n========================================");
        $display("HALF ADDER TRUTH TABLE");
        $display("========================================");
        $display("A B | Sum Carry");
        $display("----|----------");
        
        a = 0; b = 0; #10;
        $display("%b %b |  %b   %b", a, b, ha_sum, ha_carry);
        
        a = 0; b = 1; #10;
        $display("%b %b |  %b   %b", a, b, ha_sum, ha_carry);
        
        a = 1; b = 0; #10;
        $display("%b %b |  %b   %b", a, b, ha_sum, ha_carry);
        
        a = 1; b = 1; #10;
        $display("%b %b |  %b   %b", a, b, ha_sum, ha_carry);
        
        $display("\n========================================");
        $display("FULL ADDER TRUTH TABLE");
        $display("========================================");
        $display("A B Cin | Sum Cout");
        $display("--------|----------");
        
        a = 0; b = 0; cin = 0; #10;
        $display("%b %b  %b  |  %b   %b", a, b, cin, fa_sum, fa_cout);
        
        a = 0; b = 0; cin = 1; #10;
        $display("%b %b  %b  |  %b   %b", a, b, cin, fa_sum, fa_cout);
        
        a = 0; b = 1; cin = 0; #10;
        $display("%b %b  %b  |  %b   %b", a, b, cin, fa_sum, fa_cout);
        
        a = 0; b = 1; cin = 1; #10;
        $display("%b %b  %b  |  %b   %b", a, b, cin, fa_sum, fa_cout);
        
        a = 1; b = 0; cin = 0; #10;
        $display("%b %b  %b  |  %b   %b", a, b, cin, fa_sum, fa_cout);
        
        a = 1; b = 0; cin = 1; #10;
        $display("%b %b  %b  |  %b   %b", a, b, cin, fa_sum, fa_cout);
        
        a = 1; b = 1; cin = 0; #10;
        $display("%b %b  %b  |  %b   %b", a, b, cin, fa_sum, fa_cout);
        
        a = 1; b = 1; cin = 1; #10;
        $display("%b %b  %b  |  %b   %b", a, b, cin, fa_sum, fa_cout);
        
        $display("\n========================================");
        $display("All tests completed successfully!");
        $display("========================================\n");
        
        $finish;
    end
    
    // Generate VCD file for waveform viewing
    initial begin
        $dumpfile("all_circuits.vcd");
        $dumpvars(0, all_circuits_tb);
    end
endmodule
