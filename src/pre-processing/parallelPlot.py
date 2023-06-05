import numpy as np
import pandas as pd

#importo i dataset che mi servono e li unisco in un unico file per lo scatterplot

#import the csv file to work on it
#vedere se aggiungere una colonna 0: sulla posizione delle città
dataset1 = pd.read_csv("data/original/2021GreenAreaDensity.csv") #prima colonna: Green Area Density
#here i replace the missing value with np.nan
dataset1['GreenAreaDensity'] = dataset1['GreenAreaDensity'].replace('',np.nan)
dataset1 = dataset1.dropna(axis=0, how ='any')
#dataset1['GreenAreaDensity'] = dataset1['GreenAreaDensity'].astype(float)


dataset2 = pd.read_csv("data/original/2021Vehicles.csv") #seconda colonna: Low Emissions
#drop column: Fuel, Diesel e total
dataset2 = dataset2.drop(columns=['Fuel','Diesel','Total'],axis=1) 
#here i replace the missing value with np.nan
dataset2['LowEmission'] = dataset2['LowEmission'].replace('',np.nan)
dataset2 = dataset2.dropna(axis=0, how ='any')
#dataset2['LowEmission'] = dataset2['LowEmission'].astype(float)



dataset3 = pd.read_csv("data/original/2021AutobusStopDensity.csv") #terza colonna: densità delle fermate di autobus
#dataset3['AutobusStopDensity'] = dataset3['AutobusStopDensity'].replace(' - ',np.nan)
dataset3['AutobusStopDensity'] = dataset3['AutobusStopDensity'].replace(' ','')
#here i replace the missing value with np.nan
#dataset3['AutobusStopDensity'] = dataset3['AutobusStopDensity'].replace('',np.nan)
#dataset3 = dataset3.dropna(axis=0, how ='any')
#dataset3['AutobusStopDensity'] = dataset3['AutobusStopDensity'].astype(float)


dataset4 = pd.read_csv("data/original/2021CirculatingVehicles.csv") #quarta colonna: traffic
#here i replace the missing value with np.nan
dataset4['CirculatingVehicles'] = dataset4['CirculatingVehicles'].replace('',np.nan)
dataset4 = dataset4.dropna(axis=0, how ='any')
#dataset4['CirculatingVehicles'] = dataset4['CirculatingVehicles'].astype(float)

dataset5 =pd.read_csv("data/original/2021ExposedNoisePollution.csv")  #quinta colonna: Noise Levels
#drop column VA-Values
dataset5 = dataset5.drop(columns=['VA_Values'],axis=1) 
dataset5['ExposedNoisePollution'] = dataset5['ExposedNoisePollution'].replace(' - ',np.nan)
dataset5['ExposedNoisePollution'] = dataset5['ExposedNoisePollution'].str.replace(' ','')
#here i replace the missing value with np.nan
dataset5['ExposedNoisePollution'] = dataset5['ExposedNoisePollution'].replace('',np.nan)
dataset5 = dataset5.dropna(axis=0, how ='any')
#dataset5['ExposedNoisePollution'] = dataset5['ExposedNoisePollution'].astype(float)

merged_df = pd.merge(dataset1[['City', 'GreenAreaDensity']], dataset2[['City','LowEmission']], on='City', how= 'outer').set_index('City')
merged_df = pd.merge(merged_df, dataset3[['City','AutobusStopDensity']], on='City', how= 'outer').set_index('City')
merged_df = pd.merge(merged_df, dataset4[['City','CirculatingVehicles']], on='City', how= 'outer').set_index('City')
merged_df = pd.merge(merged_df, dataset5[['City','ExposedNoisePollution']], on='City', how= 'outer').set_index('City')

# stampa il dataframe risultante
print(merged_df.head())
#here I drop all the rows with null values (that generates error in the plot)
merged_df = merged_df.dropna(axis=0, how ='any')
#merged_df = merged_df['City'].replace(' ','')

#export results in a new csv
merged_df.to_csv('data/processed/ParallelPlotData.csv', header=True)