package com.shivam.monocept.config;

import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ModelMapperConfig {

    @Bean
    public ModelMapper modelMapper() {
        ModelMapper modelMapper = new ModelMapper();
        // Custom configurations (e.g. matching strategy) can be set here if needed
        modelMapper.getConfiguration()
                   .setMatchingStrategy(org.modelmapper.convention.MatchingStrategies.STRICT)
                   .setFieldMatchingEnabled(true)
                   .setFieldAccessLevel(org.modelmapper.config.Configuration.AccessLevel.PRIVATE);
        return modelMapper;
    }
}
