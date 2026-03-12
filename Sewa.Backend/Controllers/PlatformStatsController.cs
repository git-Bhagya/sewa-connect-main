using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sewa.Backend.Data;
using Sewa.Backend.Models;

namespace Sewa.Backend.Controllers
{
    [ApiController]
    [Route("api/platform-stats")]
    public class PlatformStatsController : ControllerBase
    {
        private readonly SewaDbContext _context;

        public PlatformStatsController(SewaDbContext context)
        {
            _context = context;
        }

        // GET: api/platform-stats
        [HttpGet]
        public async Task<IActionResult> GetStats()
        {
            var stats = await _context.PlatformStats.FirstOrDefaultAsync();
            if (stats == null) return NotFound();
            return Ok(stats);
        }

        // PUT: api/platform-stats
        [Authorize(Roles = "SuperAdmin")]
        [HttpPut]
        public async Task<IActionResult> UpdateStats([FromBody] PlatformStats model)
        {
            var existing = await _context.PlatformStats.FirstOrDefaultAsync();
            if (existing == null)
            {
                model.Id = 0;
                model.LastUpdated = DateTime.UtcNow;
                _context.PlatformStats.Add(model);
            }
            else
            {
                existing.TotalRaised = model.TotalRaised;
                existing.TotalSpent = model.TotalSpent;
                existing.RemainingFund = model.RemainingFund;
                existing.AnimalFund = model.AnimalFund;
                existing.EducationFund = model.EducationFund;
                existing.MedicalFund = model.MedicalFund;
                existing.OldAgeFund = model.OldAgeFund;
                existing.GeneralFund = model.GeneralFund;
                existing.UpiId = model.UpiId;
                existing.UpiQrImageUrl = model.UpiQrImageUrl;
                existing.LastUpdated = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return Ok(existing ?? model);
        }
    }
}
