document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  var alert = document.getElementById("alert");
    if (alert) {
      document.querySelector("#alert").remove();
    }

  document.querySelector('#compose-form').addEventListener("submit", function (e) {
    e.preventDefault();

    var recipients = document.querySelector('#compose-recipients').value;
    var subject = document.querySelector('#compose-subject').value;
    var body = document.querySelector('#compose-body').value;

    var alert = document.getElementById("alert");
    if (alert) {
      document.querySelector("#alert").remove();
    }


    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
      })
    })
      .then(response => response.json())
      .then(result => {

        if (result.message != null) {
          document.querySelector('#compose-recipients').value = '';
          document.querySelector('#compose-subject').value = '';
          document.querySelector('#compose-body').value = '';
          var alert = document.getElementById("alert");
          if (alert) {
            document.querySelector("#alert").remove();
          }
          const element = document.createElement('div');
          element.innerHTML = result.message;
          element.className = "alert";
          element.classList.add('alert-success');
          element.id = "alert";
          document.getElementById("compose-view").append(element);
        }
        if (result.error != null) {
          var alert = document.getElementById("alert");
          if (alert) {
            document.querySelector("#alert").remove();
          }
          const element = document.createElement('div');
          element.innerHTML = result.error;
          element.className = "alert";
          element.classList.add('alert-danger');
          element.id = "alert";
          document.getElementById("compose-view").append(element);
        }
      });
  });
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Get emails
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {

      console.log(emails);

      const element = document.createElement('div');
      element.className = "";
      element.id = "emails";
      element.innerHTML = "<table>";

      for (i of emails){
        element.innerHTML += '<tr>';
        element.innerHTML += `<th>${i.sender}</th><th>${i.subject}</th>`;
        element.innerHTML += '</tr>';
      }
      element.innerHTML += "</table>";
      document.getElementById("emails-view").append(element);
    });
}

function read_email(id) {
  // Show the mailbox and hide other views
  //document.querySelector('#read-email-view').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Get email
  fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
      // Print email
      console.log(email);

      // ... do something else with email ...
      // TODO
    });

  // Mark email as read
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
}

function unread_email(id) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: false
    })
  })

  // UI update
  // TODO

}

function archive_email(id) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: true
    })
  })

  // UI update
  // TODO

}