using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sewa.Backend.Data;
using Sewa.Backend.Models;
using System.Security.Claims;

namespace Sewa.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VolunteersController : ControllerBase
    {
        private readonly SewaDbContext _context;

        public VolunteersController(SewaDbContext context)
        {
            _context = context;
        }

        [Authorize(Roles = "SuperAdmin")]
        [HttpPost("create")]
        public async Task<IActionResult> CreateVolunteer([FromBody] Volunteer model)
        {
            // Check if user exists by email to link
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == model.Email);
            if (existingUser != null)
            {
                model.UserId = existingUser.UserId;
            }

            model.VolunteerId = 0;
            model.CreatedAt = DateTime.UtcNow;

            _context.Volunteers.Add(model);

            // If created as approved, assign role
            if (model.IsApproved && model.UserId.HasValue)
            {
                var roleExists = await _context.UserRoles.AnyAsync(ur => ur.UserId == model.UserId.Value && ur.RoleId == 5);
                if (!roleExists) _context.UserRoles.Add(new UserRole { UserId = model.UserId.Value, RoleId = 5 });
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Volunteer created successfully." });
        }

        [Authorize]
        [HttpGet("my-status")]
        public async Task<IActionResult> GetMyStatus()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
            var userId = int.Parse(userIdStr);

            var volunteer = await _context.Volunteers
                .Where(v => v.UserId == userId)
                .OrderByDescending(v => v.IsApproved) // Prioritize approved records
                .ThenByDescending(v => v.CreatedAt)    // Then get most recent
                .FirstOrDefaultAsync();

            return Ok(volunteer);
        }

        [Authorize]
        [HttpPost("register")]
        public async Task<IActionResult> RegisterVolunteer([FromBody] Volunteer model)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
            var userId = int.Parse(userIdStr);

            // Check if already has a pending or approved application
            var existing = await _context.Volunteers
                .Where(v => v.UserId == userId && v.IsApproved != false) // Technically need to handle rejection
                .OrderByDescending(v => v.CreatedAt)
                .FirstOrDefaultAsync();

            // More precise logic: allow re-apply only if most recent was rejected (e.g., deleted or marked)
            // For simplicity, let's say if there's any non-rejected one, block.
            var activeApplication = await _context.Volunteers
                .AnyAsync(v => v.UserId == userId && (v.IsApproved || !v.IsApproved)); 
            
            // Wait, if IsApproved is false it's pending. If true it's approved. 
            // Let's add a Status field or just use IsApproved. 
            // If we want to allow re-apply on rejection, we need to mark rejection.
            
            var current = await _context.Volunteers
                .Where(v => v.UserId == userId)
                .OrderByDescending(v => v.CreatedAt)
                .FirstOrDefaultAsync();

            if (current != null && current.IsApproved) 
                return BadRequest(new { message = "You are already a registered volunteer." });
            
            if (current != null && !current.IsApproved)
                return BadRequest(new { message = "Your previous application is still pending review." });

            model.VolunteerId = 0;
            model.UserId = userId;
            model.IsApproved = false;
            model.CreatedAt = DateTime.UtcNow;

            _context.Volunteers.Add(model);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Volunteer application submitted successfully." });
        }

        [Authorize(Roles = "SuperAdmin,Admin")]
        [HttpGet("pending")]
        public async Task<IActionResult> GetPendingVolunteers()
        {
            var volunteers = await _context.Volunteers
                .Where(v => !v.IsApproved)
                .OrderByDescending(v => v.CreatedAt)
                .ToListAsync();
            return Ok(volunteers);
        }

        [Authorize(Roles = "SuperAdmin,Admin")]
        [HttpGet("count-pending")]
        public async Task<IActionResult> GetCountPending()
        {
            var count = await _context.Volunteers
                .CountAsync(v => !v.IsApproved);
            return Ok(count);
        }

        [Authorize(Roles = "SuperAdmin,Admin")]
        [HttpPost("approve/{id}")]
        public async Task<IActionResult> ApproveVolunteer(int id)
        {
            var volunteer = await _context.Volunteers.FindAsync(id);
            if (volunteer == null) return NotFound();

            volunteer.IsApproved = true;
            
            // If linked to a user, update their role to Volunteer
            if (volunteer.UserId.HasValue)
            {
                var userRoleExists = await _context.UserRoles
                    .AnyAsync(ur => ur.UserId == volunteer.UserId.Value && ur.RoleId == 5); // 5 is Volunteer role

                if (!userRoleExists)
                {
                    _context.UserRoles.Add(new UserRole { UserId = volunteer.UserId.Value, RoleId = 5 });
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = $"Volunteer '{volunteer.FullName}' approved successfully." });
        }

        [Authorize(Roles = "SuperAdmin")]
        [HttpGet("list")]
        public async Task<IActionResult> GetVolunteers()
        {
            var volunteers = await _context.Volunteers
                .OrderByDescending(v => v.CreatedAt)
                .ToListAsync();
            return Ok(volunteers);
        }

        [Authorize(Roles = "SuperAdmin,Admin")]
        [HttpPost("reject/{id}")]
        public async Task<IActionResult> RejectVolunteer(int id)
        {
            var volunteer = await _context.Volunteers.FindAsync(id);
            if (volunteer == null) return NotFound();

            // Instead of just setting a flag, we delete it to allow re-applying as per user request
            _context.Volunteers.Remove(volunteer);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Application rejected and removed." });
        }

        [Authorize]
        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateVolunteer(int id, [FromBody] Volunteer model)
        {
            var volunteer = await _context.Volunteers.FindAsync(id);
            if (volunteer == null) return NotFound();

            // Check ownership or admin
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
            var userId = int.Parse(userIdStr);

            if (volunteer.UserId != userId && !User.IsInRole("SuperAdmin")) return Unauthorized();

            volunteer.FullName = model.FullName;
            volunteer.PhoneNumber = model.PhoneNumber;
            volunteer.Address = model.Address;
            volunteer.City = model.City;
            volunteer.Occupation = model.Occupation;
            volunteer.Skills = model.Skills;
            volunteer.Availability = model.Availability;
            
            // Allow SuperAdmin to update sensitive fields
            if (User.IsInRole("SuperAdmin"))
            {
                volunteer.Email = model.Email;
                volunteer.AadharNumber = model.AadharNumber;
                volunteer.IsApproved = model.IsApproved;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Volunteer details updated successfully." });
        }

        [Authorize]
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteVolunteer(int id)
        {
            var volunteer = await _context.Volunteers.FindAsync(id);
            if (volunteer == null) return NotFound();

            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
            var userId = int.Parse(userIdStr);

            if (volunteer.UserId != userId && !User.IsInRole("SuperAdmin")) return Unauthorized();

            _context.Volunteers.Remove(volunteer);
            
            // Remove Volunteer Role if linked to user
            if (volunteer.UserId.HasValue)
            {
                var userRole = await _context.UserRoles
                    .FirstOrDefaultAsync(ur => ur.UserId == volunteer.UserId.Value && ur.RoleId == 5);
                if (userRole != null) _context.UserRoles.Remove(userRole);
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Volunteer registration cancelled." });
        }
    }
}
