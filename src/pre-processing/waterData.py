import numpy as np
import pandas as pd

waterData = pd.read_csv('data/original/stazioni_superficiali.csv')
cityData = pd.read_csv('data/original/comuni.csv')

#clean and preprocess water data
waterDataClean = waterData[['Codice stazione','Comune', 'Livello di contaminazione']].set_index('Codice stazione')
waterDataClean['Comune'] = waterDataClean['Comune'].str.strip(' ')
waterDataClean['Comune'] = waterDataClean['Comune'].str.strip('"')
waterDataClean['Comune'] = waterDataClean['Comune'].str.lower()
waterDataGrouped = waterDataClean.groupby(['Comune', 'Livello di contaminazione'], as_index=True).value_counts()
waterDataGrouped.to_csv('data/processed/waterData.csv', header=True)

#clean and process city data
cityDataClean = cityData[["Denominazione in italiano","Denominazione dell'Unita territoriale sovracomunale (valida a fini statistici)"]]#.set_index('Denominazione in italiano')
cityDataClean = cityDataClean.rename({'Denominazione in italiano': 'Comune', "Denominazione dell'Unita territoriale sovracomunale (valida a fini statistici)": 'Macrocomune'}, axis=1)
cityDataClean['Comune'] = cityDataClean['Comune'].str.lower()
cityDataClean = cityDataClean.set_index('Comune')
cityDataClean.to_csv('data/processed/comuniData.csv', header=True)

#leggo i dataset processati, e li uso per il merge
waterData = pd.read_csv('data/processed/waterData.csv')
cityData = pd.read_csv('data/processed/comuniData.csv')

merged = waterData.merge(cityData, on='Comune', how='left')
merged = merged.groupby(['Macrocomune','Livello di contaminazione'], as_index=True)['count'].sum()

merged.to_csv('data/processed/mergedWaterComuni.csv', header=True)
