package ar.uba.fi.ingsoft1.todo_template.blockedSlot;

import ar.uba.fi.ingsoft1.todo_template.blockedslot.BlockedSlot;
import ar.uba.fi.ingsoft1.todo_template.field.Field;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

public class BlockedSlotTest {

    private Field field;
    private LocalDate testDate;

    @BeforeEach
    void setUp() {
        field = Field.builder()
                .name("Test Field")
                .grassType("Sintético")
                .lighting(true)
                .zone("Test Zone")
                .address("Test Address")
                .photoUrl("https://test.com/photo.jpg")
                .price(10000.0)
                .active(true)
                .build();

        testDate = LocalDate.now().plusDays(1);
    }

    @Test
    void shouldCreateBlockedSlotWithBuilder() {
        BlockedSlot slot = BlockedSlot.builder()
                .field(field)
                .date(testDate)
                .hour(20)
                .build();

        assertThat(slot.getField()).isEqualTo(field);
    }

    // testing of getters and setters most used
    @Test
    void shouldGetDateCorrectly() {
        BlockedSlot slot = BlockedSlot.builder()
                .field(field)
                .date(testDate)
                .hour(20)
                .build();

        assertThat(slot.getDate()).isEqualTo(testDate);
    }

    @Test
    void shouldGetHourCorrectly() {
        BlockedSlot slot = BlockedSlot.builder()
                .field(field)
                .date(testDate)
                .hour(20)
                .build();

        assertThat(slot.getHour()).isEqualTo(20);
    }

    @Test
    void shouldSetAndGetIdCorrectly() {
        BlockedSlot slot = new BlockedSlot();
        slot.setId(1L);

        assertThat(slot.getId()).isEqualTo(1L);
    }
}
