package gr.ath.ds.rentsystem.mapper;

import org.mapstruct.MapperConfig;
import org.mapstruct.NullValueCheckStrategy;
import org.mapstruct.ReportingPolicy;

@MapperConfig(
        componentModel = "spring",                       // να γίνει Spring Bean
        unmappedTargetPolicy = ReportingPolicy.WARN,    // ή WARN αν θες πιο χαλαρά
        nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS
)
public interface MapStructCentralConfig {
}
