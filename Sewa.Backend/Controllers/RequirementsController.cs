using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sewa.Backend.Data;
using Sewa.Backend.Models;
using Sewa.Backend.Services;
using System.Security.Claims;

namespace Sewa.Backend.Controllers
{
    [ApiController]
    [Route("api/requirements")]
    public class RequirementsController : ControllerBase
    {
        private readonly SewaDbContext _context;
        private readonly IEmailService _emailService;

        public RequirementsController(SewaDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        // POST: api/Requirements
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> AddRequirement([FromBody] OrganizationRequirement model)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
            int userId = int.Parse(userIdStr);
            string userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? "";

            // Check if organization exists
            var org = await _context.Organizations.FindAsync(model.OrganizationId);
            if (org == null) return NotFound("Organization not found");

            // Authorization: Only creator or SuperAdmin/Admin
            if (userRole != "SuperAdmin" && userRole != "Admin" && org.CreatedBy != userId)
            {
                return Forbid();
            }

            model.Id = 0; // Ensure new record
            model.CreatedAt = DateTime.UtcNow;
            model.IsActive = true;

            _context.OrganizationRequirements.Add(model);
            await _context.SaveChangesAsync();

            // Notify users who opted into this sector
            try
            {
                var targetType = model.Type?.ToLower() ?? "other";
                var usersToNotify = await _context.Users
                    .Include(u => u.Preference)
                    .Where(u => u.IsActive && u.Email != null && u.Preference != null)
                    .Where(u =>
                        (targetType == "food" && u.Preference.NotifyFood) ||
                        (targetType == "money" && u.Preference.NotifyMoney) ||
                        (targetType == "clothes" && u.Preference.NotifyClothes) ||
                        (targetType == "medical" && u.Preference.NotifyMedical) ||
                        (targetType == "other" && u.Preference.NotifyOthers)
                    )
                    .ToListAsync();

                if (usersToNotify.Any())
                {
                    string subject = $"Sewa Connect: New Help Request for {model.Type}";
                    string body = $@"
                        <div style='font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;'>
                            <h2 style='color: #059669;'>New Help Requested: {model.Title}</h2>
                            <p><strong>Organization:</strong> {org.OrganizationName}</p>
                            <p><strong>Location:</strong> {org.City}, {org.State}</p>
                            <p><strong>Type:</strong> {model.Type}</p>
                            <p><strong>Need:</strong> {model.Description}</p>
                            <hr style='border: 0; border-top: 1px solid #eee;'/>
                            <p>Someone in your community needs support. Login to Sewa Connect to help out.</p>
                            <div style='text-align: center; margin-top: 30px;'>
                                <a href='http://localhost:5173/organizations' style='background-color: #059669; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;'>View All Organizations</a>
                            </div>
                        </div>
                    ";

                    foreach (var user in usersToNotify)
                    {
                        // Fire and forget to not block response
                        _ = _emailService.SendEmailAsync(user.Email, subject, body);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Notification Error] {ex.Message}");
            }

            return Ok(model);
        }

        // DELETE: api/Requirements/{id}
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRequirement(int id)
        {
            var req = await _context.OrganizationRequirements
                .Include(r => r.Organization)
                .FirstOrDefaultAsync(r => r.Id == id);
            
            if (req == null) return NotFound();

            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
            int userId = int.Parse(userIdStr);
            string userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? "";

            // Authorization: Only creator or SuperAdmin/Admin
            if (userRole != "SuperAdmin" && userRole != "Admin" && req.Organization?.CreatedBy != userId)
            {
                return Forbid();
            }

            _context.OrganizationRequirements.Remove(req);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Requirement removed" });
        }
    }
}
