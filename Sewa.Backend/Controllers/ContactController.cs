using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sewa.Backend.Data;
using Sewa.Backend.Models;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.AspNetCore.Authorization;

namespace Sewa.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContactController : ControllerBase
    {
        private readonly SewaDbContext _context;

        public ContactController(SewaDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> SubmitInquiry([FromBody] ContactInquiry inquiry)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            inquiry.SubmittedAt = System.DateTime.UtcNow;
            _context.ContactInquiries.Add(inquiry);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Inquiry submitted successfully", id = inquiry.Id });
        }

        [HttpGet]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> GetInquiries([FromQuery] bool pendingOnly = false)
        {
            try
            {
                var query = _context.ContactInquiries.AsQueryable();
                
                if (pendingOnly)
                {
                    query = query.Where(i => !i.IsCompleted);
                }

                var inquiries = await query
                    .OrderByDescending(i => i.SubmittedAt)
                    .ToListAsync();
                return Ok(inquiries);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { 
                    error = "Database error. Please ensure you have added the 'IsCompleted' column to the 'ContactInquiries' table.",
                    details = ex.Message 
                });
            }
        }

        [HttpPost("{id}/complete")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> MarkAsCompleted(int id)
        {
            try
            {
                var inquiry = await _context.ContactInquiries.FindAsync(id);
                if (inquiry == null) return NotFound();

                inquiry.IsCompleted = true;
                await _context.SaveChangesAsync();
                return Ok(new { message = "Inquiry marked as completed" });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { 
                    error = "Database error. Please ensure you have added the 'IsCompleted' column to the 'ContactInquiries' table.",
                    details = ex.Message 
                });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> DeleteInquiry(int id)
        {
            var inquiry = await _context.ContactInquiries.FindAsync(id);
            if (inquiry == null) return NotFound();

            _context.ContactInquiries.Remove(inquiry);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Inquiry deleted" });
        }
    }
}
