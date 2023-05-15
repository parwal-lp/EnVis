import numpy as np
import pandas as pd

#importo i dataset che mi servono e li unisco in un unico file per lo scatterplot

#import the csv file to work on it
dataset1 = pd.read_csv('percentuale_centraline_limite_PM10_superato_piu_di_35_giorni.csv')
dataset2 = pd.read_csv('percentuale_energia_solare_comunale.csv')
dataset3 = pd.read_csv('percentuale_veicoli_basse_emissioni.csv')
dataset4 = pd.read_csv('percentuale_verde_urbano.csv')

#reduce the column size of field City to 20 chars
dataset1['City'] = dataset1['City'].str.strip(' ')
dataset1['Percentuale_centraline'] = dataset1['Percentuale_centraline'].replace(" ", "").replace(" - ", "0").replace(",,", ",0,")

#dataset2['City'] = dataset2['City'].str.strip(' ')
#dataset2['Percentuale_comune'] = dataset2['Percentuale_comune'].replace(" ", "").replace(" - ", "0").replace(",,", ",0,")
#dataset2['Percentuale_partecipate'] = dataset2['Percentuale_partecipate'].replace(" ", "").replace(" - ", "0").replace(",,", ",0,")

dataset3['City'] = dataset3['City'].str.strip(' ')
dataset3['Percentuale_basse_emissioni'] = dataset3['Percentuale_basse_emissioni'].replace(" ", "").replace(" - ", "0").replace(",,", ",0,")

dataset4['City'] = dataset4['City'].str.strip(' ')
dataset4['Percentuale_aree_verdi'] = dataset4['Percentuale_aree_verdi'].replace(" ", "").replace(" - ", "0").replace(",,", ",0,")

#select the columns of interest
#cols = ['City', 'Green Area Density', 'Vehicles', 'Noise', 'Emissions']
#dataset_cols = dataset1[cols]

# esegue il merge dei dataset utilizzando la colonna 'comune' come chiave
#merged_df = pd.merge(dataset1[['City', 'Percentuale_centraline']], dataset2[['City','Percentuale_comune', 'Percentuale_partecipate']], on='City', how= 'outer').set_index('City')
#merged_df = pd.merge(dataset1[['City', 'Percentuale_centraline']], dataset2[['City','Percentuale_comune', 'Percentuale_partecipate']], on='City', how= 'outer').set_index('City')
#merged_df = pd.merge(merged_df, dataset3[['City','Percentuale_basse_emissioni']], on='City', how= 'outer').set_index('City')
merged_df = pd.merge(dataset1[['City', 'Percentuale_centraline']], dataset3[['City','Percentuale_basse_emissioni']], on='City', how= 'outer').set_index('City')
merged_df = pd.merge(merged_df, dataset4[['City','Percentuale_aree_verdi']], on='City', how= 'outer').set_index('City')

#merged_df = pd.merge(merged_df, dataset2, on='City')
#merged_df = pd.merge(merged_df, dataset4, on='City')

# stampa il dataframe risultante
print(merged_df.head())

#export results in a new csv
merged_df.to_csv('ScatterPlotData.csv', header=True)