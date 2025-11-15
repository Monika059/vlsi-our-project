// Full Adder - Basic Combinational Circuit
// Adds three 1-bit inputs and produces sum and carry output using two half adders

// Half Adder building block
module half_adder (
    input  a,
    input  b,
    output sum,
    output carry
);
    assign sum   = a ^ b;
    assign carry = a & b;
endmodule

module full_adder(
    input  a,        // First input bit
    input  b,        // Second input bit
    input  cin,      // Carry input
    output sum,      // Sum output
    output cout      // Carry output
);
    // Wires for intermediate results between the half adders
    wire sum_stage;        // Sum after adding a and b
    wire carry_stage0;     // Carry from first half adder
    wire carry_stage1;     // Carry from second half adder

    // First half adder combines the two data inputs
    half_adder stage0 (
        .a    (a),
        .b    (b),
        .sum  (sum_stage),
        .carry(carry_stage0)
    );

    // Second half adder adds the carry-in to the partial sum
    half_adder stage1 (
        .a    (sum_stage),
        .b    (cin),
        .sum  (sum),
        .carry(carry_stage1)
    );

    // Carry out is the OR of the half-adder carries
    assign cout = carry_stage0 | carry_stage1;
endmodule

// Testbench for Full Adder
module full_adder_tb;
    reg a, b, cin;
    wire sum, cout;
    
    // Instantiate the full adder
    full_adder uut (
        .a(a),
        .b(b),
        .cin(cin),
        .sum(sum),
        .cout(cout)
    );
    
    initial begin
        $display("Full Adder Test");
        $display("A B Cin | Sum Cout");
        $display("--------|----------");
        
        // Test all 8 combinations
        a = 0; b = 0; cin = 0; #10;
        $display("%b %b  %b  |  %b   %b", a, b, cin, sum, cout);
        
        a = 0; b = 0; cin = 1; #10;
        $display("%b %b  %b  |  %b   %b", a, b, cin, sum, cout);
        
        a = 0; b = 1; cin = 0; #10;
        $display("%b %b  %b  |  %b   %b", a, b, cin, sum, cout);
        
        a = 0; b = 1; cin = 1; #10;
        $display("%b %b  %b  |  %b   %b", a, b, cin, sum, cout);
        
        a = 1; b = 0; cin = 0; #10;
        $display("%b %b  %b  |  %b   %b", a, b, cin, sum, cout);
        
        a = 1; b = 0; cin = 1; #10;
        $display("%b %b  %b  |  %b   %b", a, b, cin, sum, cout);
        
        a = 1; b = 1; cin = 0; #10;
        $display("%b %b  %b  |  %b   %b", a, b, cin, sum, cout);
        
        a = 1; b = 1; cin = 1; #10;
        $display("%b %b  %b  |  %b   %b", a, b, cin, sum, cout);
        
        $finish;
    end
endmodule
