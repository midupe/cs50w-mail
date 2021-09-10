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
  document.querySelector('#read-email-view').style.display = 'none';

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
  document.querySelector('#read-email-view').style.display = 'none';
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
      const table = document.createElement('table');

      for (i of emails){
        var sender = i.sender;
        if (mailbox == "sent"){
          sender = i.recipients;
        }

        if (i.read == true){
          table.innerHTML += `<tr onclick="read_email(${i.id})"><th style="background-color: white; font-weight: bold;">${sender}</th><th style="background-color: white;">${i.subject}</th><th style="background-color: white; text-align: right;">${i.timestamp}</th></tr>`;
        } else {
          table.innerHTML += `<tr onclick="read_email(${i.id})"><th style="font-weight: bold;">${sender}</th><th>${i.subject}</th><th style="text-align: right;">${i.timestamp}</th></tr>`;
        }

      }
      
      element.appendChild(table);
      document.getElementById("emails-view").append(element);
    });
}



function read_email(id) {
  // Mark email as read
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })

  // Show the mailbox and hide other views
  const element = document.querySelector('#read-email-view');
  element.style.display = 'block';
  element.innerHTML = "";
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Get email
  fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
      // Print email
      console.log(email);
      if (email.archived == true) {
        var arch = document.createElement('a');
        arch.innerHTML = `<button style="margin: 0 10px 10px 0;" class="btn btn-sm btn-primary" onclick="unarchive_email(${email.id})">Unarchive</button>`;
        element.appendChild(arch);
      } else {
        var arch = document.createElement('a');
        arch.innerHTML = `<button style="margin: 0 10px 10px 0;" class="btn btn-sm btn-primary" onclick="archive_email(${email.id})">Archive</button>`;
        element.appendChild(arch);
      }
      var unread = document.createElement('a');
      unread.innerHTML = `<button style="margin: 0 10px 10px 0;" class="btn btn-sm btn-primary" onclick="unread_email(${email.id})">Unread</button>`;
      element.appendChild(unread);
      var i = document.createElement('p');
      i.innerHTML = `<b>From:</b> ${email.sender}`;
      element.appendChild(i);
      var j = document.createElement('p');
      j.innerHTML = `<b>To:</b> ${email.recipients}`;
      element.appendChild(j);
      var o = document.createElement('p');
      o.innerHTML = `<b>Subject:</b> ${email.subject}`;
      element.appendChild(o);
      var p = document.createElement('p');
      p.innerHTML = `<b>Timestamp:</b> ${email.timestamp}`;
      element.appendChild(p);
      var hr = document.createElement('hr');
      element.appendChild(hr);
      var b = document.createElement('p');
      b.innerHTML = `${email.body}`;
      element.appendChild(b);
    });

  // display element
  document.getElementsByClassName('container')[0].appendChild(element);
}

function unread_email(id) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: false
    })
  });

  var alert = document.getElementById("alert");
          if (alert) {
            document.querySelector("#alert").remove();
          }
          const element = document.createElement('div');
          element.innerHTML = 'Email unreaded!';
          element.className = "alert";
          element.classList.add('alert-secondary');
          element.id = "alert";
          document.getElementById("read-email-view").append(element);

}

function unarchive_email(id) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: false
    })
  });

  var alert = document.getElementById("alert");
  if (alert) {
    document.querySelector("#alert").remove();
  }
  const element = document.createElement('div');
  element.innerHTML = 'Email unarchived!';
  element.className = "alert";
  element.classList.add('alert-secondary');
  element.id = "alert";
  document.getElementById("read-email-view").append(element);

}

function archive_email(id) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: true
    })
  })

  var alert = document.getElementById("alert");
  if (alert) {
    document.querySelector("#alert").remove();
  }
  const element = document.createElement('div');
  element.innerHTML = 'Email archived!';
  element.className = "alert";
  element.classList.add('alert-secondary');
  element.id = "alert";
  document.getElementById("read-email-view").append(element);

}