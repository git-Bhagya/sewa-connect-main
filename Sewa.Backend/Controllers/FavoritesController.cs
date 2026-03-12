using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sewa.Backend.Data;
using Sewa.Backend.Models;
using System.Security.Claims;

namespace Sewa.Backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class FavoritesController : ControllerBase
    {
        private readonly SewaDbContext _context;

        public FavoritesController(SewaDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetFavorites()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
            int userId = int.Parse(userIdStr);

            var favorites = await _context.Favorites
                .Where(f => f.UserId == userId)
                .Select(f => f.OrganizationId)
                .ToListAsync();

            return Ok(favorites);
        }

        [HttpPost("{orgId}")]
        public async Task<IActionResult> ToggleFavorite(int orgId)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
            int userId = int.Parse(userIdStr);

            var existing = await _context.Favorites
                .FirstOrDefaultAsync(f => f.UserId == userId && f.OrganizationId == orgId);

            if (existing != null)
            {
                _context.Favorites.Remove(existing);
                await _context.SaveChangesAsync();
                return Ok(new { isFavorite = false });
            }
            else
            {
                var favorite = new Favorite
                {
                    UserId = userId,
                    OrganizationId = orgId
                };
                _context.Favorites.Add(favorite);
                await _context.SaveChangesAsync();
                return Ok(new { isFavorite = true });
            }
        }
    }
}
