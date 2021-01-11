## Data

#### countries.csv

The data comes from the following sources:

- https://en.wikipedia.org/wiki/List_of_countries_by_population_(United_Nations)
- https://www.worldometers.info/world-population/population-by-country/

Column name | content
------------ | -------------
  ISO_3166_1 | The three digit country code according to ISO 3166-1 (numeric code)
  country | country name
  country_alt | alternative country name (often same as country)
  territory | territory name if not country, country otherwise
  region | Region according to the UN geoscheme
  subregion | Subregion according to the UN geoscheme
  population_2018 | population in 2018
  population_2019 | population in 2018
  population_change_2019 | population change 2019 vs 2018 in % 
  population_2020 | population in 2020
  population_change_2020 | population change 2020 vs 2019 in %
  population_change_2020_net | net population change 2020 vs 2019 
  density | density (population / km^2 )
  area | land area in km^2
  migrants_net | net migration movement 
  fert_rate | fertility rate (number of children per woman)
  age_median | median of age
  pop_urban_perc | % of population living in urban area
  world_share | population share of world population
  flag | link to flag

#### countries_r.csv

Like *countries.csv* but reduced to the following columns:
