using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sewa.Backend.Data;
using Sewa.Backend.Models;
using Sewa.Backend.Services;
using System.Security.Claims;

namespace Sewa.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GroupsController : ControllerBase
    {
        private readonly SewaDbContext _context;
        private readonly IEmailService _emailService;

        public GroupsController(SewaDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        // GET: api/Groups
        [HttpGet]
        public async Task<IActionResult> GetGroups([FromQuery] string? city, [FromQuery] string? search)
        {
            var query = _context.SewaGroups
                .Where(g => g.IsApproved)
                .AsQueryable();

            if (!string.IsNullOrEmpty(city))
            {
                query = query.Where(g => g.City == city);
            }

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(g => g.GroupName.Contains(search) || g.Description.Contains(search));
            }

            var groups = await query.OrderByDescending(g => g.CreatedAt).ToListAsync();
            return Ok(groups);
        }

        // POST: api/Groups/register
        [Authorize]
        [HttpPost("register")]
        public async Task<IActionResult> RegisterGroup([FromBody] SewaGroup group)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

            group.GroupId = 0;
            group.CreatedBy = int.Parse(userIdStr);
            group.CreatedAt = DateTime.UtcNow;
            group.IsApproved = false; // Requires admin approval

            _context.SewaGroups.Add(group);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Group registration submitted for approval", groupId = group.GroupId });
        }

        // POST: api/Groups/{id}/request-help
        [HttpPost("{id}/request-help")]
        public async Task<IActionResult> RequestHelp(int id, [FromBody] HelpRequestModel model)
        {
            var group = await _context.SewaGroups.FindAsync(id);
            if (group == null) return NotFound();

            if (string.IsNullOrEmpty(group.ContactEmail))
            {
                return BadRequest(new { message = "Group does not have a registered contact email." });
            }

            string subject = $"Help Request from Sewa Connect: {model.Subject}";
            string body = $@"
                <h3>Help Request Received</h3>
                <p><strong>From:</strong> {model.UserName} ({model.UserEmail})</p>
                <p><strong>Phone:</strong> {model.UserPhone}</p>
                <p><strong>Message:</strong></p>
                <p>{model.Message}</p>
                {(string.IsNullOrEmpty(model.ImageUrl) ? "" : $"<p><strong>Attached Image:</strong> <br/><img src='{model.ImageUrl}' style='max-width:300px;'/></p>")}
                <hr/>
                <p>Please contact the user directly or reply to this email.</p>
            ";

            await _emailService.SendEmailAsync(group.ContactEmail, subject, body);

            return Ok(new { message = "Help request sent to the group via email." });
        }

        [Authorize(Roles = "SuperAdmin,Admin")]
        [HttpGet("pending")]
        public async Task<IActionResult> GetPendingGroups()
        {
            var pending = await _context.SewaGroups
                .Where(g => !g.IsApproved)
                .OrderByDescending(g => g.CreatedAt)
                .ToListAsync();
            return Ok(pending);
        }

        [Authorize(Roles = "SuperAdmin,Admin")]
        [HttpGet("count-pending")]
        public async Task<IActionResult> GetCountPending()
        {
            var count = await _context.SewaGroups
                .Where(g => !g.IsApproved)
                .CountAsync();
            return Ok(count);
        }

        // POST: api/Groups/approve/{id}
        [Authorize(Roles = "SuperAdmin,Admin")]
        [HttpPost("approve/{id}")]
        public async Task<IActionResult> ApproveGroup(int id)
        {
            var group = await _context.SewaGroups.FindAsync(id);
            if (group == null) return NotFound();

            group.IsApproved = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Group '{group.GroupName}' approved successfully." });
        }

        // DELETE: api/Groups/{id}
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGroup(int id)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
            int userId = int.Parse(userIdStr);
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            var group = await _context.SewaGroups.FindAsync(id);
            if (group == null) return NotFound();

            // Allow if user is SuperAdmin or the Creator (Owner)
            bool isSuperAdmin = User.IsInRole("SuperAdmin");
            if (!isSuperAdmin && group.CreatedBy != userId)
            {
                return Forbid();
            }

            _context.SewaGroups.Remove(group);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Group deleted successfully." });
        }

        // PUT: api/Groups/{id}
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateGroup(int id, [FromBody] SewaGroup groupData)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
            int userId = int.Parse(userIdStr);
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            var group = await _context.SewaGroups.FindAsync(id);
            if (group == null) return NotFound();

            // Allow if user is SuperAdmin or the Creator (Owner)
            bool isSuperAdmin = User.IsInRole("SuperAdmin");
            if (!isSuperAdmin && group.CreatedBy != userId)
            {
                return Forbid();
            }

            group.GroupName = groupData.GroupName;
            group.Description = groupData.Description;
            group.MemberCount = groupData.MemberCount;
            group.City = groupData.City;
            group.State = groupData.State;
            group.ContactPhone = groupData.ContactPhone;
            group.ContactEmail = groupData.ContactEmail;
            group.LogoUrl = groupData.LogoUrl;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Group updated successfully.", group });
        }

        public class HelpRequestModel
        {
            public string UserName { get; set; } = string.Empty;
            public string UserEmail { get; set; } = string.Empty;
            public string UserPhone { get; set; } = string.Empty;
            public string Subject { get; set; } = string.Empty;
            public string Message { get; set; } = string.Empty;
            public string? ImageUrl { get; set; }
        }
    }
}
