import numpy as np
import pandas as pd
from matplotlib import pyplot as plt
from sklearn.decomposition import PCA
from sklearn import preprocessing
from sklearn.discriminant_analysis import StandardScaler

dataset = pd.read_csv('data/processed/mergedPesticidiConMacrocomuniZero.csv')

#transform data into a shape usable with pca
#transformed_dataset = dataset.pivot_table('Conc_max', ['Macrocomune'], 'Sostanza')
#transformed_dataset = dataset.set_index(['Macrocomune','Sostanza','Conc_max'], drop=True).unstack('Sostanza')
transformed_dataset = pd.pivot_table(dataset, values='Conc_max', index=['Macrocomune'], columns=['Sostanza'], aggfunc=np.max, fill_value=0).reset_index()



transformed_dataset.to_csv('data/processed/transformedWaterData.csv', index=False)

#cols = transformed_dataset.loc[:, transformed_dataset.columns != 'Macrocomune']
transformed_dataset_numeric = transformed_dataset.drop('Macrocomune', axis=1)
# define standard scaler
scaler = StandardScaler()
# transform data
scaled = scaler.fit_transform(transformed_dataset_numeric)

pca = PCA(n_components=2)
components = pca.fit_transform(scaled)
principal_components = pca.components_
df_components = pd.DataFrame(data=components, columns=['PC1', 'PC2'])

df_components['City']= transformed_dataset['Macrocomune'] #aggiungo la colonna con l'indicazione di quale citta si tratta. Posso farlo perche la pca mantiene l'ordine delle righe

#plt.scatter(df_components['PC1'], df_components['PC2'])

#plt.xlabel('PC1')
#plt.ylabel('PC2')
#plt.title('test scatter con PCA')

#plt.show()

df_components.to_csv('data/processed/pcaWaterResults.csv', index=False)