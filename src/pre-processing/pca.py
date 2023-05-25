import numpy as np
import pandas as pd
from matplotlib import pyplot as plt
from sklearn.decomposition import PCA
from sklearn import preprocessing
from sklearn.discriminant_analysis import StandardScaler

dataset = pd.read_csv('data/processed/ScatterPlotData.csv')
cols = ['Percentuale_centraline', 'Percentuale_basse_emissioni','Percentuale_energia_solare', 'Percentuale_aree_verdi']

# define standard scaler
scaler = StandardScaler()
# transform data
scaled = scaler.fit_transform(dataset[cols])

pca = PCA(n_components=2)
components = pca.fit_transform(scaled)
principal_components = pca.components_
df_components = pd.DataFrame(data=components, columns=['PC1', 'PC2'])

#plt.scatter(df_components['PC1'], df_components['PC2'])

#plt.xlabel('PC1')
#plt.ylabel('PC2')
#plt.title('test scatter con PCA')

#plt.show()




df_components.to_csv('data/processed/pcaResults.csv', index=False)