import pandas as pd
import numpy as np

#import the csv file to work on it
dataset1 = pd.read_csv('BoxPlot_DensityGreenArea2020.csv')
dataset2 = pd.read_csv('BoxPlot_VehicleDensity2020.csv')
dataset3 = pd.read_csv('BoxPlot_VehicleEmission2020.csv')
dataset4 = pd.read_csv('BoxPlot_Noise2020.csv')

#reduce the column size of field City to 20 chars
#dataset1['City'] = dataset1['City'].str.replace(" ", "")

#select the columns of interest
#cols = ['City', 'Green Area Density', 'Vehicles', 'Noise', 'Emissions']
#dataset_cols = dataset1[cols]

# esegue il merge dei dataset utilizzando la colonna 'comune' come chiave
merged_df = pd.merge(dataset1[['City', 'GreenAreaDensity']], dataset3[['City','GasBifuel', 'TotalEmission']], on='City', how= 'outer').set_index('City')
merged_df = pd.merge(merged_df, dataset2[['City','VehicleDensity']], on='City', how= 'outer').set_index('City')
merged_df = pd.merge(merged_df, dataset4[['City','NoisePollution']], on='City', how= 'outer').set_index('City')

#merged_df = pd.merge(merged_df, dataset2, on='City')
#merged_df = pd.merge(merged_df, dataset4, on='City')

# stampa il dataframe risultante
print(merged_df.head())

#export results in a new csv
merged_df.to_csv('BoxPlotData.csv', header=True)