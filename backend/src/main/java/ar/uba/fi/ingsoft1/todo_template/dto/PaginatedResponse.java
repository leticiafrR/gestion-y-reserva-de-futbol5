package ar.uba.fi.ingsoft1.todo_template.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "Paginated response wrapper")
public record PaginatedResponse<T>(
    @Schema(description = "List of results for the current page")
    List<T> results,
    
    @Schema(description = "Pagination information")
    PaginationInfo pagination
) {
    @Schema(description = "Pagination metadata")
    public record PaginationInfo(
        @Schema(description = "Current page number")
        int page,
        
        @Schema(description = "Number of items per page")
        int limit,
        
        @Schema(description = "Total number of results")
        long totalResults,
        
        @Schema(description = "Total number of pages")
        int totalPages
    ) {}
} 