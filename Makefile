TAG = registry.betunit.com/energaming-services/nrg_website
VERSION = v2.0.0

docker-run: docker-build
	docker run -it $(TAG):$(VERSION)

docker-build:
	docker build -t $(TAG):$(VERSION) -f Dockerfile .
	say build complete

docker-push:
	docker push $(TAG):$(VERSION)
	say push complete

.PHONY: docker
docker: docker-build
	docker push $(TAG):$(VERSION)
	say push complete
