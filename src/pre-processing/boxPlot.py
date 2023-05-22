import pandas as pd
import numpy as np

#import the csv file to work on it
#first file Green Area Density
dataset1 = pd.read_csv("data/original/2021GreenAreaDensity.csv") #../../data/original/2021GreenAreaDensity.csv
#dataset1 = dataset1.drop(columns=['SquareMeters'], axis=1) #non serve perchè non c'è più la colonna SquareMeters
dataset1['Category'] = "GreenAreaDensity"
#dataset1 = dataset1.set_index('City', 'Category')
dataset1.rename(columns = {'GreenAreaDensity':'Value'}, inplace = True)

#second file Fuel
dataset2 = pd.read_csv("data/original/2021Vehicles.csv")
dataset2 = dataset2.drop(columns=['Diesel','LowEmission','Total'],axis=1) 
dataset2['Category'] = "Fuel"
#dataset2 = dataset2.set_index('City', 'Category')
dataset2.rename(columns = {'Fuel':'Value'}, inplace = True)

#Third file Diesel
dataset3 = pd.read_csv("data/original/2021Vehicles.csv")
dataset3 = dataset3.drop(columns=['Fuel', 'LowEmission', 'Total'],axis=1) 
dataset3['Category'] = "Diesel"
dataset3.rename(columns = {'Diesel':'Value'}, inplace = True)

#fourth file Low Emission
dataset4 = pd.read_csv("data/original/2021Vehicles.csv")
dataset4 = dataset4.drop(columns=['Fuel','Diesel','Total'],axis=1) 
dataset4['Category'] = "LowEmission"
dataset4.rename(columns = {'LowEmission':'Value'}, inplace = True)

#fifth and sixth file Noise Pollution
dataset5 = pd.read_csv("data/original/2021Noise.csv")
dataset5 = dataset5.drop(columns=['CommercialNoise','TemporaryNoise','Infrastructure','Others','Total'],axis=1) 
dataset5['Category'] = "IndustrialNoise"
dataset5.rename(columns = {'IndustrialNoise':'Value'}, inplace = True)

dataset6 = pd.read_csv("data/original/2021Noise.csv")
dataset6 = dataset6.drop(columns=['IndustrialNoise','TemporaryNoise','Infrastructure','Others','Total'],axis=1) 
dataset6['Category'] = "CommercialNoise"
dataset6.rename(columns = {'CommercialNoise':'Value'}, inplace = True)

#seventh file Waste Collection Road
dataset7 = pd.read_csv("data/original/2021WasteCollection.csv")
dataset7 = dataset7.drop(columns=['Door_to_door_Waste'],axis=1) 
dataset7['Category'] = "Road_Waste"
dataset7.rename(columns = {'Road_Waste':'Value'}, inplace = True)

#insert also door to door waste collection?
#dataset8 = pd.read_csv("data/original/2021WasteCollection.csv")
#dataset8 = dataset8.drop(columns=['Road_Waste'],axis=1) 
#dataset8['Category'] = "Door_to_door_Waste"
#dataset8.rename(columns = {'Door_to_door_Waste':'Value'}, inplace = True)


#here start the union of the datasets
merged_df = pd.concat([dataset1,dataset2], ignore_index=True)
merged_df = pd.concat([merged_df,dataset3], ignore_index=True)
merged_df = pd.concat([merged_df,dataset4], ignore_index=True)
merged_df = pd.concat([merged_df,dataset5], ignore_index=True)
merged_df = pd.concat([merged_df,dataset6], ignore_index=True)
merged_df = pd.concat([merged_df,dataset7], ignore_index=True)
#merged_df = pd.concat([merged_df,dataset8], ignore_index=True)

#export results in a new csv
merged_df.to_csv('data/processed/BoxPlotData.csv', header=True, index=False)