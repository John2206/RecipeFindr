import React, { useState } from 'react';

function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // You can add actual submission logic here if needed
  };

  return (
    <main>
      <section className="hero">
        <h1>Contact Us</h1>
        <p>If you have any questions or suggestions, feel free to contact us.</p>
        {submitted ? (
          <div className="message">Thank you for your message!</div>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input type="text" id="name" name="name" required value={form.name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" required value={form.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" rows="5" required value={form.message} onChange={handleChange}></textarea>
            </div>
            <button type="submit" className="submit-btn">Send Message</button>
          </form>
        )}
        <div className="contact-info">
          <p>Created by <strong style={{ color: '#ff5733' }}>Gjergj Brestovci</strong> and <strong style={{ color: '#ff5733' }}>Jonathan Löscher</strong></p>
          <p>Email: contact@recipefindr.com</p>
        </div>
      </section>
    </main>
  );
}

export default ContactPage;