using Microsoft.AspNetCore.Mvc;
using TelefonRehberApi.Models;
using TelefonRehberApi.Services;

namespace TelefonRehberApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContactsController : ControllerBase
{
    private readonly IContactService _contactService;
    private readonly ILogger<ContactsController> _logger;

    public ContactsController(IContactService contactService, ILogger<ContactsController> logger)
    {
        _contactService = contactService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Contact>>> GetAll(CancellationToken cancellationToken)
    {
        var contacts = await _contactService.GetAllAsync(cancellationToken);
        return Ok(contacts);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Contact>> GetById(int id, CancellationToken cancellationToken)
    {
        var contact = await _contactService.GetByIdAsync(id, cancellationToken);
        if (contact is null)
        {
            _logger.LogWarning("Contact {Id} not found", id);
            return NotFound();
        }
        return Ok(contact);
    }

    [HttpPost]
    public async Task<ActionResult<Contact>> Create(Contact contact, CancellationToken cancellationToken)
    {
        var created = await _contactService.CreateAsync(contact, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, Contact updated, CancellationToken cancellationToken)
    {
        if (id != updated.Id)
        {
            _logger.LogWarning("Update rejected: URL id {UrlId} != body id {BodyId}", id, updated.Id);
            return BadRequest("ID in URL does not match contact ID.");
        }

        try
        {
            await _contactService.UpdateAsync(id, updated, cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var deleted = await _contactService.DeleteAsync(id, cancellationToken);
        if (!deleted)
            return NotFound();
        return NoContent();
    }
}
