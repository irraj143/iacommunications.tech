(function () {
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");

  function closeNav() {
    if (!nav || !navToggle) return;
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
  }

  if (nav) {
    const list = nav.querySelector("ul");
    if (list && !list.querySelector(".nav-phone")) {
      const phoneItem = document.createElement("li");
      phoneItem.className = "nav-phone";
      const phoneLink = document.createElement("a");
      phoneLink.href = "tel:+923438778331";
      phoneLink.textContent = "03438778331";
      phoneItem.appendChild(phoneLink);
      list.appendChild(phoneItem);
    }
    if (list && !list.querySelector(".nav-extra")) {
      const item = document.createElement("li");
      item.className = "nav-extra";
      const link = document.createElement("a");
      link.href = "contact.html";
      link.textContent = "Get a Free Consultation";
      item.appendChild(link);
      list.appendChild(item);
    }
  }

  document.querySelectorAll(".whatsapp").forEach(function (link) {
    if (link.querySelector("svg")) return;
    link.insertAdjacentHTML(
      "afterbegin",
      '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M20.5 3.5A11 11 0 0 0 2.1 17.8L1 23l5.4-1.1A11 11 0 0 0 20.5 3.5zM12 20.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3.2.7.7-3.1-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.7.9-.3.2-.5.1a6.7 6.7 0 0 1-2-1.2 7.4 7.4 0 0 1-1.4-1.7c-.1-.2 0-.4.1-.5l.4-.4.2-.3a.5.5 0 0 0 0-.4c0-.1-.5-1.3-.7-1.7s-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4 15 15 0 0 0 1.5.5 3.6 3.6 0 0 0 1.7.1 2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.2-.1-.4-.2z"/></svg>'
    );
  });

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      const open = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("nav-open", open);
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeNav();
    });
  }

  const revealItems = document.querySelectorAll(".reveal, .reveal-zoom, .stagger");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );
    revealItems.forEach(function (item) {
      observer.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  document.querySelectorAll(".faq-item").forEach(function (item) {
    const button = item.querySelector(".faq-question");
    const panel = item.querySelector(".faq-answer");
    if (!button || !panel) return;

    button.addEventListener("click", function () {
      const expanded = button.getAttribute("aria-expanded") === "true";
      const group = item.closest(".faq-list");
      if (group) {
        group.querySelectorAll(".faq-item").forEach(function (other) {
          if (other === item) return;
          const otherButton = other.querySelector(".faq-question");
          const otherPanel = other.querySelector(".faq-answer");
          if (otherButton && otherPanel) {
            otherButton.setAttribute("aria-expanded", "false");
            otherPanel.hidden = true;
          }
        });
      }
      button.setAttribute("aria-expanded", expanded ? "false" : "true");
      panel.hidden = expanded;
    });
  });

  const config = window.IA_SITE || { contactEmail: "", formEndpoint: "" };
  document.querySelectorAll("[data-config-email]").forEach(function (node) {
    if (config.contactEmail) {
      const link = document.createElement("a");
      link.href = "mailto:" + config.contactEmail;
      link.textContent = config.contactEmail;
      node.replaceChildren(link);
    }
  });

  document.querySelectorAll("[data-inquiry-form]").forEach(function (form) {
    const status = form.querySelector(".form-status");
    const submit = form.querySelector("[type='submit']");

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      clearErrors(form);
      if (status) {
        status.hidden = true;
        status.className = "form-status";
        status.textContent = "";
      }

      const valid = validateForm(form);
      if (!valid) {
        const firstInvalid = form.querySelector("[aria-invalid='true']");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const payload = Object.fromEntries(new FormData(form).entries());
      payload.formType = form.getAttribute("data-inquiry-form") || "contact";

      if (submit) submit.disabled = true;

      try {
        if (config.formEndpoint) {
          const response = await fetch(config.formEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(payload),
          });
          if (!response.ok) throw new Error("Request failed");
          form.reset();
          showStatus(
            status,
            "success",
            "Thank you. Your inquiry has been sent. Our team will review your requirements."
          );
        } else if (config.contactEmail) {
          const subject = encodeURIComponent(
            payload.formType === "career"
              ? "Career application — " + (payload.name || "Applicant")
              : "Business inquiry — " + (payload.name || "Website visitor")
          );
          const body = encodeURIComponent(formatMessage(payload));
          window.location.href =
            "mailto:" + config.contactEmail + "?subject=" + subject + "&body=" + body;
          showStatus(
            status,
            "success",
            "Your email app should open with this inquiry. If it does not, call or WhatsApp 03438778331."
          );
        } else {
          showStatus(
            status,
            "error",
            "This form is ready, but an email destination has not been configured yet. Please call or WhatsApp 03438778331."
          );
        }
      } catch (error) {
        showStatus(
          status,
          "error",
          "We could not send your inquiry. Please call or WhatsApp 03438778331."
        );
      } finally {
        if (submit) submit.disabled = false;
      }
    });
  });

  function showStatus(node, type, message) {
    if (!node) return;
    node.hidden = false;
    node.className = "form-status is-" + type;
    node.setAttribute("role", type === "error" ? "alert" : "status");
    node.textContent = message;
  }

  function clearErrors(form) {
    form.querySelectorAll(".field-error").forEach(function (error) {
      error.textContent = "";
    });
    form.querySelectorAll("[aria-invalid='true']").forEach(function (field) {
      field.removeAttribute("aria-invalid");
    });
  }

  function setError(field, message) {
    field.setAttribute("aria-invalid", "true");
    const error = field.closest(".field")?.querySelector(".field-error");
    if (error) error.textContent = message;
  }

  function validateForm(form) {
    let valid = true;
    const required = form.querySelectorAll("[required]");
    required.forEach(function (field) {
      const value = field.value.trim();
      if (!value) {
        setError(field, "This field is required.");
        valid = false;
        return;
      }
      if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setError(field, "Enter a valid email address.");
        valid = false;
      }
      if (field.name === "phone" && value.replace(/\D/g, "").length < 7) {
        setError(field, "Enter a valid phone or WhatsApp number.");
        valid = false;
      }
    });
    return valid;
  }

  function formatMessage(payload) {
    const labels = {
      name: "Name",
      company: "Company Name",
      email: "Business Email",
      phone: "Phone / WhatsApp",
      service: "Service Required",
      message: "Requirements",
      formType: "Inquiry type",
    };
    return Object.keys(payload)
      .filter(function (key) {
        return payload[key];
      })
      .map(function (key) {
        return (labels[key] || key) + ": " + payload[key];
      })
      .join("\n");
  }
})();
