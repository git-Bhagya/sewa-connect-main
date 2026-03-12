using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sewa.Backend.Data;
using Sewa.Backend.Models;
using System.Security.Claims;

namespace Sewa.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly SewaDbContext _context;

        public ProfileController(SewaDbContext context)
        {
            _context = context;
        }

        // GET: api/Profile
        [HttpGet]
        public async Task<IActionResult> GetProfile()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

            var userId = int.Parse(userIdStr);
            var user = await _context.Users
                .Include(u => u.Preference)
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null) return NotFound();

            return Ok(new {
                user.UserId,
                user.Email,
                user.FullName,
                user.PhoneNumber,
                user.CreatedAt,
                Roles = user.UserRoles.Select(ur => ur.Role.RoleName),
                user.Preference
            });
        }

        // PUT: api/Profile/update
        [HttpPut("update")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto updateModel)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

            var userId = int.Parse(userIdStr);
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();

            user.FullName = updateModel.FullName;
            user.PhoneNumber = updateModel.PhoneNumber;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Profile updated successfully." });
        }

        // PUT: api/Profile/preferences
        [HttpPut("preferences")]
        public async Task<IActionResult> UpdatePreferences([FromBody] UpdatePreferencesDto prefs)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

            var userId = int.Parse(userIdStr);
            var existingPrefs = await _context.UserPreferences.FindAsync(userId);

            if (existingPrefs == null)
            {
                var newPrefs = new UserPreference
                {
                    UserId = userId,
                    NotifyFood = prefs.NotifyFood,
                    NotifyMoney = prefs.NotifyMoney,
                    NotifyClothes = prefs.NotifyClothes,
                    NotifyMedical = prefs.NotifyMedical,
                    NotifyOthers = prefs.NotifyOthers
                };
                _context.UserPreferences.Add(newPrefs);
            }
            else
            {
                existingPrefs.NotifyFood = prefs.NotifyFood;
                existingPrefs.NotifyMoney = prefs.NotifyMoney;
                existingPrefs.NotifyClothes = prefs.NotifyClothes;
                existingPrefs.NotifyMedical = prefs.NotifyMedical;
                existingPrefs.NotifyOthers = prefs.NotifyOthers;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Preferences updated successfully." });
        }
    }

    public class UpdateProfileDto
    {
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
    }

    public class UpdatePreferencesDto
    {
        public bool NotifyFood { get; set; } = true;
        public bool NotifyMoney { get; set; } = true;
        public bool NotifyClothes { get; set; } = true;
        public bool NotifyMedical { get; set; } = true;
        public bool NotifyOthers { get; set; } = true;
    }
}
