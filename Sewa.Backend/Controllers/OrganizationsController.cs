using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sewa.Backend.Data;
using Sewa.Backend.Models;
using System.Security.Claims;

namespace Sewa.Backend.Controllers
{
    [ApiController]
    [Route("api/organizations")]
    public class OrganizationsController : ControllerBase
    {
        private readonly SewaDbContext _context;

        public OrganizationsController(SewaDbContext context)
        {
            _context = context;
        }

        // GET: api/Organizations/types
        [HttpGet("types")]
        public async Task<IActionResult> GetTypes()
        {
            var types = await _context.OrganizationTypes.ToListAsync();
            return Ok(types);
        }

        // GET: api/Organizations/cities
        [HttpGet("cities")]
        public async Task<IActionResult> GetCities()
        {
            var cities = await _context.Organizations
                .Where(o => o.IsActive && o.IsApproved && !string.IsNullOrEmpty(o.City))
                .Select(o => o.City!.Trim())
                .Distinct()
                .ToListAsync();

            return Ok(cities);
        }

        // GET: api/Organizations/list
        [HttpGet("list")]
        public async Task<IActionResult> GetOrganizations([FromQuery] string? search, [FromQuery] int? typeId, [FromQuery] string? city, [FromQuery] string? preferredCity, [FromQuery] int page = 1, [FromQuery] int pageSize = 12)
        {
            var query = _context.Organizations
                .Include(o => o.OrganizationType)
                .Where(o => o.IsActive && o.IsApproved);

            if (!string.IsNullOrEmpty(search))
            {
                var lowerSearch = search.ToLower();
                query = query.Where(o => 
                    (o.OrganizationName != null && o.OrganizationName.ToLower().Contains(lowerSearch)) || 
                    (o.Description != null && o.Description.ToLower().Contains(lowerSearch)) ||
                    o.Requirements.Any(r => 
                        (r.Title != null && r.Title.ToLower().Contains(lowerSearch)) || 
                        (r.Description != null && r.Description.ToLower().Contains(lowerSearch))
                    )
                );
            }

            // Strict Filter (Only if user specifically filters by city in the search bar)
            if (!string.IsNullOrEmpty(city) && city != "all")
                query = query.Where(o => o.City != null && o.City.Contains(city));

            if (typeId.HasValue)
                query = query.Where(o => o.OrganizationTypeId == typeId.Value);

            var totalItems = await query.CountAsync();

            // TIERED SORTING LOGIC:
            // 1. HELP + PREFERRED CITY (Weight 4)
            // 2. HELP + OTHER CITY (Weight 3)
            // 3. NO HELP + PREFERRED CITY (Weight 2)
            // 4. NO HELP + OTHER CITY (Weight 1)
            var organizations = await query
                .OrderByDescending(o => 
                    (o.Requirements.Any(r => r.IsActive) ? 2 : 0) + 
                    (!string.IsNullOrEmpty(preferredCity) && o.City == preferredCity ? 1 : 0)
                )
                .ThenByDescending(o => o.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(o => new {
                    o.OrganizationId,
                    o.OrganizationName,
                    o.OrganizationTypeId,
                    organizationType = o.OrganizationType != null ? new { 
                        o.OrganizationType.OrganizationTypeId, 
                        o.OrganizationType.TypeName 
                    } : null,
                    o.Description,
                    o.Address,
                    o.City,
                    o.State,
                    o.ContactPhone,
                    o.ContactEmail,
                    o.ImageUrl,
                    paymentQrImageUrl = (string?)null, // Not in current DB schema
                    upiId = (string?)null,          // Not in current DB schema
                    o.IsActive,
                    o.CreatedAt,
                    o.CreatedBy,
                    images = o.Images.Select(i => new { i.Id, i.ImageUrl }).ToList(),
                    requirements = o.Requirements.Select(r => new { 
                        r.Id, 
                        r.Title, 
                        r.Description, 
                        r.Type, 
                        r.IsActive, 
                        r.CreatedAt 
                    }).ToList()
                })
                .ToListAsync();

            return Ok(new {
                items = organizations,
                totalItems = totalItems,
                page = page,
                pageSize = pageSize
            });
        }

        // This endpoint seems to be called by the frontend based on the screenshot (api/organizations/pending)
        // Adding it here as a shortcut or it should be in AdminController, but the screenshot shows Organizations/pending
        [Authorize(Roles = "SuperAdmin,Admin")]
        [HttpGet("pending")]
        public async Task<IActionResult> GetPendingOrganizations()
        {
            var pending = await _context.Organizations
                .Include(o => o.OrganizationType)
                .Include(o => o.Creator)
                .Where(o => !o.IsApproved)
                .ToListAsync();

            return Ok(pending);
        }

        // GET: api/Organizations/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrganization(int id)
        {
            var org = await _context.Organizations
                .Include(o => o.OrganizationType)
                .Include(o => o.Images)
                .Include(o => o.Requirements)
                .FirstOrDefaultAsync(o => o.OrganizationId == id);

            if (org == null) return NotFound();

            return Ok(org);
        }

        // POST: api/Organizations/register
        [Authorize]
        [HttpPost("register")]
        public async Task<IActionResult> RegisterOrganization([FromBody] Organization model)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

            model.OrganizationId = 0; // Ensure new record
            model.CreatedBy = int.Parse(userIdStr);
            model.CreatedAt = DateTime.UtcNow;
            model.IsApproved = false; // Requires admin approval
            model.IsActive = true;

            _context.Organizations.Add(model);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetOrganization), new { id = model.OrganizationId }, model);
        }
        // POST: api/Organizations/{id}/approve
        [Authorize(Roles = "SuperAdmin,Admin")]
        [HttpPost("{id}/approve")]
        public async Task<IActionResult> ApproveOrganization(int id)
        {
            var org = await _context.Organizations.FindAsync(id);
            if (org == null) return NotFound();

            org.IsApproved = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Organization '{org.OrganizationName}' approved successfully." });
        }

        // PUT: api/Organizations/{id}
        [Authorize(Roles = "SuperAdmin,Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOrganization(int id, [FromBody] Organization model)
        {
            if (id != model.OrganizationId) return BadRequest("ID mismatch");

            var existing = await _context.Organizations.FindAsync(id);
            if (existing == null) return NotFound();

            existing.OrganizationName = model.OrganizationName;
            existing.Description = model.Description;
            existing.Address = model.Address;
            existing.City = model.City;
            existing.State = model.State;
            existing.ContactPhone = model.ContactPhone;
            existing.ContactEmail = model.ContactEmail;
            existing.UpiId = model.UpiId;
            existing.OrganizationTypeId = model.OrganizationTypeId;
            existing.ImageUrl = model.ImageUrl;
            existing.PaymentQrImageUrl = model.PaymentQrImageUrl;

            await _context.SaveChangesAsync();
            return Ok(existing);
        }

        // DELETE: api/Organizations/{id}
        [Authorize(Roles = "SuperAdmin,Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrganization(int id)
        {
            var org = await _context.Organizations.FindAsync(id);
            if (org == null) return NotFound();

            _context.Organizations.Remove(org);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Organization removed successfully" });
        }
    }
}
