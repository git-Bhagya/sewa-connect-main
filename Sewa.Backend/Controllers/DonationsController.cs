using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Razorpay.Api;
using Sewa.Backend.Data;
using Sewa.Backend.Models;
using System.Security.Claims;

namespace Sewa.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DonationsController : ControllerBase
    {
        private readonly SewaDbContext _context;
        private readonly IConfiguration _configuration;

        public DonationsController(SewaDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("create-order")]
        public IActionResult CreateOrder([FromBody] OrderRequest model)
        {
            try
            {
                string key = _configuration["Razorpay:KeyId"];
                string secret = _configuration["Razorpay:KeySecret"];

                if (string.IsNullOrEmpty(key) || key.Contains("YOUR_KEY"))
                {
                    return BadRequest("Razorpay is not configured properly.");
                }

                RazorpayClient client = new RazorpayClient(key, secret);

                Dictionary<string, object> options = new Dictionary<string, object>();
                options.Add("amount", model.Amount * 100); // Amount in paise
                options.Add("currency", "INR");
                options.Add("receipt", Guid.NewGuid().ToString());

                Order order = client.Order.Create(options);
                string orderId = order["id"].ToString();

                // Log the donation attempt in DB
                var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                int? userId = string.IsNullOrEmpty(userIdStr) ? null : int.Parse(userIdStr);

                var donation = new Donation
                {
                    Amount = model.Amount,
                    RazorpayOrderId = orderId,
                    UserId = userId,
                    OrganizationId = model.OrganizationId,
                    Sector = model.Sector,
                    Status = "Created",
                    CreatedAt = DateTime.UtcNow
                };

                _context.Donations.Add(donation);
                _context.SaveChanges();

                return Ok(new
                {
                    orderId = orderId,
                    amount = model.Amount * 100,
                    key = key,
                    currency = "INR"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("verify-payment")]
        public async Task<IActionResult> VerifyPayment([FromBody] PaymentVerificationRequest model)
        {
            try
            {
                string key = _configuration["Razorpay:KeyId"];
                string secret = _configuration["Razorpay:KeySecret"];

                RazorpayClient client = new RazorpayClient(key, secret);

                Dictionary<string, string> attributes = new Dictionary<string, string>();
                attributes.Add("razorpay_payment_id", model.RazorpayPaymentId);
                attributes.Add("razorpay_order_id", model.RazorpayOrderId);
                attributes.Add("razorpay_signature", model.RazorpaySignature);

                Utils.verifyPaymentSignature(attributes);

                // Update donation status in DB
                var donation = await _context.Donations
                    .FirstOrDefaultAsync(d => d.RazorpayOrderId == model.RazorpayOrderId);

                if (donation != null)
                {
                    donation.RazorpayPaymentId = model.RazorpayPaymentId;
                    donation.RazorpaySignature = model.RazorpaySignature;
                    donation.Status = "Captured";

                    // Update platform stats if it's a general fund or update org balance
                    var stats = await _context.PlatformStats.FirstOrDefaultAsync();
                    if (stats != null)
                    {
                        stats.TotalRaised += donation.Amount;
                        stats.RemainingFund += donation.Amount;
                        
                        var sector = donation.Sector?.ToLower();
                        if (sector == "animal_care") stats.AnimalFund += donation.Amount;
                        else if (sector == "education") stats.EducationFund += donation.Amount;
                        else if (sector == "medical_aid") stats.MedicalFund += donation.Amount;
                        else if (sector == "old_age_home") stats.OldAgeFund += donation.Amount;
                        else stats.GeneralFund += donation.Amount;
                    }

                    await _context.SaveChangesAsync();
                }

                return Ok(new { status = "success", message = "Payment verified successfully" });
            }
            catch (Exception ex)
            {
                // Payment verification failed
                var donation = await _context.Donations
                    .FirstOrDefaultAsync(d => d.RazorpayOrderId == model.RazorpayOrderId);
                
                if (donation != null)
                {
                    donation.Status = "Failed";
                    await _context.SaveChangesAsync();
                }

                return BadRequest(new { status = "error", message = "Invalid signature" });
            }
        }

        [HttpPost("dummy-payment")]
        public async Task<IActionResult> DummyPayment([FromBody] OrderRequest model)
        {
            try
            {
                var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                int? userId = string.IsNullOrEmpty(userIdStr) ? null : int.Parse(userIdStr);

                string dummyOrderId = "dummy_order_" + Guid.NewGuid().ToString("N");

                var donation = new Donation
                {
                    Amount = model.Amount,
                    RazorpayOrderId = dummyOrderId,
                    RazorpayPaymentId = "dummy_pay_" + Guid.NewGuid().ToString("N"),
                    RazorpaySignature = "dummy_signature_verified",
                    UserId = userId,
                    OrganizationId = model.OrganizationId,
                    Sector = model.Sector,
                    Status = "Captured",
                    CreatedAt = DateTime.UtcNow
                };

                _context.Donations.Add(donation);

                var stats = await _context.PlatformStats.FirstOrDefaultAsync();
                if (stats != null)
                {
                    stats.TotalRaised += donation.Amount;
                    stats.RemainingFund += donation.Amount;
                    
                    var sector = donation.Sector?.ToLower();
                    if (sector == "animal_care") stats.AnimalFund += donation.Amount;
                    else if (sector == "education") stats.EducationFund += donation.Amount;
                    else if (sector == "medical_aid") stats.MedicalFund += donation.Amount;
                    else if (sector == "old_age_home") stats.OldAgeFund += donation.Amount;
                    else stats.GeneralFund += donation.Amount;
                }

                await _context.SaveChangesAsync();

                return Ok(new { 
                    status = "success", 
                    message = "Dummy Payment verified successfully",
                    donationId = donation.Id,
                    amount = donation.Amount,
                    date = donation.CreatedAt,
                    orderId = donation.RazorpayOrderId
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { status = "error", message = ex.Message });
            }
        }

        [HttpGet("organization/{id}")]
        public async Task<IActionResult> GetDonorsByOrganization(int id)
        {
            try
            {
                var donations = await _context.Donations
                    .Where(d => d.OrganizationId == id && d.Status == "Captured")
                    .OrderByDescending(d => d.CreatedAt)
                    .Take(10)
                    .Select(d => new
                    {
                        Amount = d.Amount,
                        CreatedAt = d.CreatedAt,
                        DonorName = d.User != null && !string.IsNullOrEmpty(d.User.FullName) ? d.User.FullName : "Anonymous Donor"
                    })
                    .ToListAsync();
                
                return Ok(donations);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("recent")]
        public async Task<IActionResult> GetRecentDonations([FromQuery] int limit = 50)
        {
            try
            {
                var donations = await _context.Donations
                    .Where(d => d.Status == "Captured")
                    .OrderByDescending(d => d.CreatedAt)
                    .Take(limit)
                    .Select(d => new
                    {
                        Id = d.Id,
                        Amount = d.Amount,
                        CreatedAt = d.CreatedAt,
                        Sector = d.Sector,
                        DonorName = d.User != null && !string.IsNullOrEmpty(d.User.FullName) ? d.User.FullName : "Anonymous Donor",
                        OrganizationName = d.Organization != null ? d.Organization.OrganizationName : null
                    })
                    .ToListAsync();

                return Ok(donations);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        public class OrderRequest
        {
            public decimal Amount { get; set; }
            public int? OrganizationId { get; set; }
            public string? Sector { get; set; }
        }

        public class PaymentVerificationRequest
        {
            public string RazorpayOrderId { get; set; } = string.Empty;
            public string RazorpayPaymentId { get; set; } = string.Empty;
            public string RazorpaySignature { get; set; } = string.Empty;
        }
    }
}
