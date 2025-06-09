package ar.uba.fi.ingsoft1.todo_template.team.invitation;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class InvitationFormatService {

    @Autowired
    private MessageSource messageSource;
    @Autowired
    private TemplateEngine templateEngine;

    public List<String> getContEmailNormalized (String teamName, String to, String token, Locale locale){
        String subject = messageSource.getMessage(
                "mail.subject.invitation.team",
                new Object[]{ teamName },
                locale
        );
        String htmlContent = getInvitationHtmlContent(locale, token, teamName);
        var normalized = new ArrayList<String>();
        normalized.add(to);
        normalized.add(subject);
        normalized.add(htmlContent);
        return normalized;
    }

    private String getInvitationHtmlContent(Locale locale, String token, String teamName){
        Context context = new Context(locale);
        context.setVariable("title", messageSource.getMessage("mail.template.title", null, locale));
        context.setVariable("body", messageSource.getMessage("mail.template.invitation.team.body", new Object[]{ teamName }, locale));
        context.setVariable("url", messageSource.getMessage("mail.invitation.team.url", null, locale) + token);
        return templateEngine.process("team-invitation-email.html", context);
    }
}
