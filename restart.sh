for port in 4002 3002 4001 3001 4000 3000; do lsof -ti :$port | xargs -r kill -9; done

cd ./packages/zambdas/src && ln -sf ../../../custom-packages/ehr/zambdas/src ./custom-ehr && cd ../../../

cd ./packages/zambdas/src && ln -sf ../../../custom-packages/intake/zambdas/src ./custom-patient && cd ../../../

npm run apps:start

# rm -rf node_modules 
# rm -rf apps/**/node_modules 
# rm -rf packages/**/node_modules 
# rm -rf custom-packages/**/node_modules