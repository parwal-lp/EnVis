import pandas as pd
import numpy as np

#import the csv file to work on it
dataset = pd.read_csv('AirQualityData.csv')

#reduce the column size of field City to 20 chars
dataset['City'] = dataset['City'].str.strip(' ')

#select the columns of interest
cols = ['Air Pollutant', 'Air Pollution Level', 'City']
dataset_cols = dataset[cols]

#select the rows of interest (where we analyze specific pollutants)
dataset_rows = dataset_cols.loc[dataset_cols['Air Pollutant'].isin(['CO', 'PM2.5', 'PM10', 'NO2', 'NOX as NO2', 'SO2', 'O3'])]

#gruop by city and pollutant and compute the mean of the pollution level for each pollutant and each city
dataset_mean = dataset_rows.groupby(['Air Pollutant', 'City'])['Air Pollution Level'].mean()

#print result in terminal
print(dataset_mean)
#export results in a new csv
#dataset = pd.DataFrame(dataset_mean, columns=['AirPollutant', 'AirPollutionLevel', 'City'])
dataset_mean.to_csv('../../data/processed/StarPlotData.csv', header=True)
#dataset_mean.to_csv('BarChartData.csv')