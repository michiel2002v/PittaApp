using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PittaApp.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddOrderRounds : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "OrderRounds",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DeliveryDate = table.Column<DateOnly>(type: "date", nullable: false),
                    CutoffAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    DeliveredAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderRounds", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_OrderRounds_DeliveryDate",
                table: "OrderRounds",
                column: "DeliveryDate");

            migrationBuilder.CreateIndex(
                name: "IX_OrderRounds_Status",
                table: "OrderRounds",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OrderRounds");
        }
    }
}
