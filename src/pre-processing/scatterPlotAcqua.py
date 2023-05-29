import numpy as np
import pandas as pd

#read dati acqua comuni
liguria = pd.read_csv('data/original/acqua_regioni/liguria.csv')
molise = pd.read_csv('data/original/acqua_regioni/molise.csv')
abruzzo = pd.read_csv('data/original/acqua_regioni/abruzzo.csv')
basilicata = pd.read_csv('data/original/acqua_regioni/basilicata.csv')
bolzano = pd.read_csv('data/original/acqua_regioni/bolzano.csv')
emilia = pd.read_csv('data/original/acqua_regioni/emilia.csv')
friuli = pd.read_csv('data/original/acqua_regioni/friuli.csv')
lazio = pd.read_csv('data/original/acqua_regioni/lazio.csv')
lombardia = pd.read_csv('data/original/acqua_regioni/lombardia.csv')
marche = pd.read_csv('data/original/acqua_regioni/marche.csv')
piemonte = pd.read_csv('data/original/acqua_regioni/piemonte.csv')
puglia = pd.read_csv('data/original/acqua_regioni/puglia.csv')
sardegna = pd.read_csv('data/original/acqua_regioni/sardegna.csv')
sicilia = pd.read_csv('data/original/acqua_regioni/sicilia.csv')
toscana = pd.read_csv('data/original/acqua_regioni/toscana.csv')
trento = pd.read_csv('data/original/acqua_regioni/trento.csv')
umbria = pd.read_csv('data/original/acqua_regioni/umbria.csv')
veneto = pd.read_csv('data/original/acqua_regioni/veneto.csv')
#read dati acqua italia
italia = pd.read_csv('data/original/stazioni_superficiali.csv')
#read dati citta e comuni
cityData = pd.read_csv('data/processed/comuniData.csv')

#unisci i dati acqua dei comuni in un unico file
# liguria = liguria.append(molise)
# liguria = liguria.append(abruzzo)
# liguria = liguria.append(basilicata)
# liguria = liguria.append(bolzano)
# liguria = liguria.append(emilia)
# liguria = liguria.append(friuli)
# liguria = liguria.append(lazio)
# liguria = liguria.append(lombardia)
# liguria = liguria.append(marche)
# liguria = liguria.append(piemonte)
# liguria = liguria.append(puglia)
# liguria = liguria.append(sardegna)
# liguria = liguria.append(sicilia)
# liguria = liguria.append(toscana)
# liguria = liguria.append(trento)
# liguria = liguria.append(umbria)
# liguria = liguria.append(veneto)

# liguria.rename(columns = {'cod_Staz,C,254':'Codice stazione'}, inplace = True)
# liguria.rename(columns = {'sostanza,C,254':'Sostanza'}, inplace = True)
# liguria.rename(columns = {'conc_max,N,33,15':'Conc_max'}, inplace = True)
# liguria.rename(columns = {'conc_media,N,33,15':'Conc_media'}, inplace = True)

# acqua_tutti_comuni = liguria.merge(italia, on='Codice stazione', how='left')

# acqua_tutti_comuni = acqua_tutti_comuni[['Codice stazione',"Sostanza", "Conc_max", 'Comune']]

# acqua_tutti_comuni_no_zero = acqua_tutti_comuni[acqua_tutti_comuni.Conc_max != 0]


#export results in a new csv
# acqua_tutti_comuni.to_csv('data/processed/ScatterPlotAcqua.csv', header=True)
# acqua_tutti_comuni_no_zero.to_csv('data/processed/ScatterPlotAcquaNoZero.csv', header=True)

acqua_tutti_comuni_no_zero = pd.read_csv('data/processed/ScatterPlotAcqua.csv')
acqua_tutti_comuni_no_zero['Comune'] = acqua_tutti_comuni_no_zero['Comune'].str.lower()
acqua_tutti_comuni_no_zero = acqua_tutti_comuni_no_zero.reset_index(drop=True)
acqua_tutti_comuni_no_zero = acqua_tutti_comuni_no_zero.drop(['Unnamed: 0'], axis=1)
acqua_tutti_comuni_no_zero = acqua_tutti_comuni_no_zero.reset_index(drop=True)
acqua_tutti_comuni_no_zero = acqua_tutti_comuni_no_zero.set_index(['Comune'])

acqua_tutti_comuni_no_zero.to_csv('data/processed/acqua_tutti_comuni.csv', header=True)




mergedMacrocomuni = acqua_tutti_comuni_no_zero.merge(cityData, on='Comune', how='left')#.set_index(['Macrocomune','Sostanza'])
mergedMacrocomuni = mergedMacrocomuni.groupby(['Macrocomune','Sostanza'], as_index=True)['Conc_max'].max()

#mergedMacrocomuni = pd.merge(acqua_tutti_comuni_no_zero['Codice stazione','Sostanza','Comune, Conc_max'], cityData, on='Comune', how='left')

mergedMacrocomuni.to_csv('data/processed/mergedPesticidiConMacrocomuniZero.csv', header=True)