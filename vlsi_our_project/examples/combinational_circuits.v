// 4:2 Priority Encoder
module priority_encoder_4to2(
    input [3:0] d,
    output reg [1:0] y,
    output reg valid
);
    always @* begin
        valid = 1'b1;
        casex(d)
            4'b1xxx: y = 2'b11;
            4'b01xx: y = 2'b10;
            4'b001x: y = 2'b01;
            4'b0001: y = 2'b00;
            default: begin
                y = 2'b00;
                valid = 1'b0;
            end
        endcase
    end
endmodule

// 2:4 Decoder
module decoder_2to4(
    input [1:0] a,
    output reg [3:0] y
);
    always @* begin
        case(a)
            2'b00: y = 4'b0001;
            2'b01: y = 4'b0010;
            2'b10: y = 4'b0100;
            2'b11: y = 4'b1000;
            default: y = 4'b0000;
        endcase
    end
endmodule

// 4-bit Comparator
module comparator_4bit(
    input [3:0] a, b,
    output eq,  // a == b
    output gt,  // a > b
    output lt   // a < b
);
    assign eq = (a == b);
    assign gt = (a > b);
    assign lt = (a < b);
endmodule
