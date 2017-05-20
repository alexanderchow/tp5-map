# Format data downloaded from:
# http://data.worldbank.org/data-catalog/world-development-indicators
# That data has been removed from this repository because it is quite large.

library(dplyr)
library(tidyr)
setwd('~C:\Users\chowi\Desktop\tp5-map-chowicus')
data <- read.csv("data/ihme-life-expectancy.csv")


# Subset data to rows/columns of interest
variables <- c('Location', 'FIPS')
data.shape

# Write csv
#write.csv(subset, 'data/prepped_data.csv', row.names = FALSE)