using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sewa.Backend.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddVolunteerFeatureFinal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Organizations",
                keyColumn: "OrganizationId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 22, 6, 11, 22, 249, DateTimeKind.Utc).AddTicks(6237));

            migrationBuilder.UpdateData(
                table: "Organizations",
                keyColumn: "OrganizationId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 22, 6, 11, 22, 249, DateTimeKind.Utc).AddTicks(6245));

            migrationBuilder.UpdateData(
                table: "Organizations",
                keyColumn: "OrganizationId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 22, 6, 11, 22, 249, DateTimeKind.Utc).AddTicks(6252));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
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
        }
    }
}
