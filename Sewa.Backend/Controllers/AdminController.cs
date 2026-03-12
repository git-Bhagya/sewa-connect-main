using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sewa.Backend.Data;
using Sewa.Backend.Models;

namespace Sewa.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public class AdminController : ControllerBase
    {
        private readonly SewaDbContext _context;

        public AdminController(SewaDbContext context)
        {
            _context = context;
        }

        // GET: api/Admin/pending-organizations
        [HttpGet("pending-organizations")]
        public async Task<IActionResult> GetPendingOrganizations()
        {
            var pending = await _context.Organizations
                .Include(o => o.OrganizationType)
                .Include(o => o.Creator)
                .Where(o => !o.IsApproved)
                .ToListAsync();

            return Ok(pending);
        }

        // POST: api/Admin/approve-organization/{id}
        [HttpPost("approve-organization/{id}")]
        public async Task<IActionResult> ApproveOrganization(int id)
        {
            var org = await _context.Organizations.FindAsync(id);
            if (org == null) return NotFound();

            org.IsApproved = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Organization '{org.OrganizationName}' approved successfully." });
        }

        // GET: api/Admin/users
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .Select(u => new {
                    u.UserId,
                    u.Email,
                    u.FullName,
                    u.IsActive,
                    u.CreatedAt,
                    Roles = u.UserRoles.Select(ur => ur.Role.RoleName)
                })
                .ToListAsync();

            return Ok(users);
        }
    }
}
