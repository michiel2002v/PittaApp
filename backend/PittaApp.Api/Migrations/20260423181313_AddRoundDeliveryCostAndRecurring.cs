using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PittaApp.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddRoundDeliveryCostAndRecurring : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DeliveryCostCents",
                table: "OrderRounds",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsRecurringWeekly",
                table: "OrderRounds",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DeliveryCostCents",
                table: "OrderRounds");

            migrationBuilder.DropColumn(
                name: "IsRecurringWeekly",
                table: "OrderRounds");
        }
    }
}
