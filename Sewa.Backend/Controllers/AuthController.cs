using Microsoft.AspNetCore.Mvc;
using Sewa.Backend.DTOs;
using Sewa.Backend.Services;

namespace Sewa.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("request-otp")]
        public async Task<IActionResult> RequestOtp([FromBody] RequestOtpDto model)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // DEV MODE BYPASS: Skip OTP and return token immediately for ALL emails
            var response = await _authService.VerifyOtpAsync(new VerifyOtpDto { Email = model.Email, Otp = "BYPASS" });
            if (response != null) return Ok(response);

            var success = await _authService.RequestOtpAsync(model);
            if (success)
            {
                return Ok(new { message = "OTP sent successfully to your email." });
            }

            return BadRequest(new { message = "Failed to send OTP. Please try again." });
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpDto model)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var response = await _authService.VerifyOtpAsync(model);
            if (response != null)
            {
                return Ok(response);
            }

            return Unauthorized(new { message = "Invalid or expired OTP." });
        }
    }
}
