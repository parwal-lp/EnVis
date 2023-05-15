import numpy as np
import pandas as pd
from matplotlib import pyplot as plt
from sklearn.decomposition import PCA
from sklearn import preprocessing

dataset = pd.read_csv('ScatterPlotData.csv')
cols = ['Percentuale_centraline', 'Percentuale_basse_emissioni', 'Percentuale_aree_verdi']
pca = PCA(n_components=2)
components = pca.fit_transform(dataset[cols])
principal_components = pca.components_
df_components = pd.DataFrame(data=components, columns=['PC1', 'PC2'])

#plt.scatter(df_components['PC1'], df_components['PC2'])

#plt.xlabel('PC1')
#plt.ylabel('PC2')
#plt.title('test scatter con PCA')

#plt.show()

df_components.to_csv('pcaResults.csv', index=False)