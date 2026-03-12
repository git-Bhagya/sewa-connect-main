using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sewa.Backend.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddVolunteerFeature : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Organizations_Users_CreatedByUserId",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "PaymentQrImageUrl",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "UpiId",
                table: "Organizations");

            migrationBuilder.RenameColumn(
                name: "CreatedByUserId",
                table: "Organizations",
                newName: "CreatedBy");

            migrationBuilder.RenameIndex(
                name: "IX_Organizations_CreatedByUserId",
                table: "Organizations",
                newName: "IX_Organizations_CreatedBy");

            migrationBuilder.CreateTable(
                name: "Volunteers",
                columns: table => new
                {
                    VolunteerId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FullName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    AadharNumber = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    City = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Occupation = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Skills = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Availability = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsApproved = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Volunteers", x => x.VolunteerId);
                    table.ForeignKey(
                        name: "FK_Volunteers_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserId");
                });

            migrationBuilder.UpdateData(
                table: "Organizations",
                keyColumn: "OrganizationId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 22, 6, 5, 36, 642, DateTimeKind.Utc).AddTicks(2859));

            migrationBuilder.UpdateData(
                table: "Organizations",
                keyColumn: "OrganizationId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 22, 6, 5, 36, 642, DateTimeKind.Utc).AddTicks(2870));

            migrationBuilder.UpdateData(
                table: "Organizations",
                keyColumn: "OrganizationId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 22, 6, 5, 36, 642, DateTimeKind.Utc).AddTicks(2879));

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "RoleId", "RoleName" },
                values: new object[] { 5, "Volunteer" });

            migrationBuilder.CreateIndex(
                name: "IX_Volunteers_UserId",
                table: "Volunteers",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Organizations_Users_CreatedBy",
                table: "Organizations",
                column: "CreatedBy",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Organizations_Users_CreatedBy",
                table: "Organizations");

            migrationBuilder.DropTable(
                name: "Volunteers");

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "RoleId",
                keyValue: 5);

            migrationBuilder.RenameColumn(
                name: "CreatedBy",
                table: "Organizations",
                newName: "CreatedByUserId");

            migrationBuilder.RenameIndex(
                name: "IX_Organizations_CreatedBy",
                table: "Organizations",
                newName: "IX_Organizations_CreatedByUserId");

            migrationBuilder.AddColumn<string>(
                name: "PaymentQrImageUrl",
                table: "Organizations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UpiId",
                table: "Organizations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Organizations",
                keyColumn: "OrganizationId",
                keyValue: 1,
                columns: new[] { "CreatedAt", "PaymentQrImageUrl", "UpiId" },
                values: new object[] { new DateTime(2026, 2, 22, 3, 9, 48, 135, DateTimeKind.Utc).AddTicks(8451), null, null });

            migrationBuilder.UpdateData(
                table: "Organizations",
                keyColumn: "OrganizationId",
                keyValue: 2,
                columns: new[] { "CreatedAt", "PaymentQrImageUrl", "UpiId" },
                values: new object[] { new DateTime(2026, 2, 22, 3, 9, 48, 135, DateTimeKind.Utc).AddTicks(8455), null, null });

            migrationBuilder.UpdateData(
                table: "Organizations",
                keyColumn: "OrganizationId",
                keyValue: 3,
                columns: new[] { "CreatedAt", "PaymentQrImageUrl", "UpiId" },
                values: new object[] { new DateTime(2026, 2, 22, 3, 9, 48, 135, DateTimeKind.Utc).AddTicks(8457), null, null });

            migrationBuilder.AddForeignKey(
                name: "FK_Organizations_Users_CreatedByUserId",
                table: "Organizations",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
