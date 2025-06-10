package ar.uba.fi.ingsoft1.todo_template.user.verification;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class VerificationFormatService {
    @Autowired
    private MessageSource messageSource;
    @Autowired
    private TemplateEngine templateEngine;

    public List<String> getContEmailNormalized (String to, String token, Locale locale){
        String subject = messageSource.getMessage("mail.subject.verification", null, locale);
        String htmlContent = getVerificationHtmlContent(locale, token);
        var normalized = new ArrayList<String>();
        normalized.add(to);
        normalized.add(subject);
        normalized.add(htmlContent);
        return normalized;
    }

    private String getVerificationHtmlContent(Locale locale, String token) {
        Context context = new Context(locale);
        context.setVariable("title", messageSource.getMessage("mail.template.title", null, locale));
        context.setVariable("body", messageSource.getMessage("mail.template.verification.body", null, locale));
        context.setVariable("url", messageSource.getMessage("mail.verification.url", null, locale) + token);
        return templateEngine.process("team-invitation-email.html", context);
    }
}
