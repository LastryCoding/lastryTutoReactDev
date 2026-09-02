# Deploiement

React Quest est construit en site Astro statique, servi par nginx sans privilege
sur le port interne `8080`. Seul Caddy publie le service sur Internet. Le Compose
n'a volontairement aucune section `ports`.

## Valeurs de production

| Valeur                        | Production                                               |
| ----------------------------- | -------------------------------------------------------- |
| Domaine                       | `reactquest.lastry.fr`                                   |
| DNS IPv4 attendu              | `62.169.27.147`                                          |
| Branche                       | `main`                                                   |
| Depot                         | `https://github.com/LastryCoding/lastryTutoReactDev.git` |
| Repertoire Komodo React Quest | `/opt/komodo/stacks/reactquest`                          |
| Compose                       | `/opt/komodo/stacks/reactquest/docker-compose.yml`       |
| Repertoire Komodo Caddy       | `/opt/komodo/stacks/caddy`                               |
| Caddyfile                     | `/opt/komodo/stacks/caddy/Caddyfile`                     |
| Projet Compose                | `reactquest`                                             |
| Reseau Docker externe         | `caddy`                                                  |

Si le reseau ou le Stack Caddy existant porte un autre nom, l'agent doit utiliser
ce nom reel pour `CADDY_NETWORK`; il ne doit pas creer un second reseau Caddy.

## Configuration Komodo

Creer un Stack Git nomme `reactquest` avec les valeurs suivantes :

```toml
[[stack]]
name = "reactquest"

[stack.config]
server = "production"
repo = "LastryCoding/lastryTutoReactDev"
branch = "main"
run_directory = "/opt/komodo/stacks/reactquest"
file_paths = ["docker-compose.yml"]
project_name = "reactquest"
environment = """
CADDY_NETWORK=caddy
REACTQUEST_IMAGE=reactquest:latest
"""
extra_args = "--build --remove-orphans"
```

Le nom `production` doit correspondre au Server Komodo rattache au VPS. Komodo
clone le depot dans `run_directory`, ecrit son `.env` depuis `environment`, puis
execute Compose depuis ce chemin. Aucun secret applicatif n'est requis.

## Preparation par l'agent VPS

Verifier d'abord le DNS et les prerequis. Ces commandes doivent toutes reussir :

```bash
dig +short A reactquest.lastry.fr | grep -Fxq 62.169.27.147
docker version
docker compose version
docker network inspect caddy >/dev/null
test -f /opt/komodo/stacks/caddy/Caddyfile
```

Pour un deploiement pilote directement depuis le shell, hors action Komodo :

```bash
sudo install -d -m 0755 /opt/komodo/stacks/reactquest
sudo chown "$(id -u):$(id -g)" /opt/komodo/stacks/reactquest
git clone https://github.com/LastryCoding/lastryTutoReactDev.git /opt/komodo/stacks/reactquest
cd /opt/komodo/stacks/reactquest
export COMPOSE_PROJECT_NAME=reactquest
export CADDY_NETWORK=caddy
export REACTQUEST_IMAGE=reactquest:latest
docker compose config --quiet
docker compose build --pull reactquest
docker compose up -d --remove-orphans
docker compose ps
```

Ne pas lancer `git clone` si Komodo a deja cree le repertoire. Dans ce cas,
utiliser l'action **Deploy** du Stack apres avoir valide sa configuration.

## Caddy

Ajouter ce bloc a `/opt/komodo/stacks/caddy/Caddyfile` :

```caddyfile
reactquest.lastry.fr {
	encode zstd gzip

	header {
		Cross-Origin-Opener-Policy "same-origin"
		Cross-Origin-Embedder-Policy "require-corp"
		X-Content-Type-Options "nosniff"
		Referrer-Policy "strict-origin-when-cross-origin"
		-Server
	}

	reverse_proxy reactquest:8080
}
```

`Cross-Origin-Opener-Policy` et `Cross-Origin-Embedder-Policy` sont poses par
Caddy, qui controle la reponse publique. Ils sont indispensables a
`crossOriginIsolated`, `SharedArrayBuffer` et WebContainers. Tout futur contenu
charge depuis une autre origine devra fournir une politique CORP ou des en-tetes
CORS compatibles avec `require-corp`.

Valider et recharger Caddy depuis son Stack :

```bash
cd /opt/komodo/stacks/caddy
docker compose exec -T caddy caddy validate --config /etc/caddy/Caddyfile
docker compose exec -T caddy caddy reload --config /etc/caddy/Caddyfile
```

Le service Caddy et `reactquest` doivent partager le reseau Docker externe
`caddy`. La resolution de `reactquest:8080` se fait par le DNS Docker; aucun port
hote ne doit etre ajoute.

## Controles

Sante interne, etat Docker et sante publique :

```bash
cd /opt/komodo/stacks/reactquest
export CADDY_NETWORK=caddy
docker compose exec -T reactquest wget -qO- http://127.0.0.1:8080/healthz
docker inspect --format='{{.State.Health.Status}}' "$(docker compose ps -q reactquest)"
curl -fsS https://reactquest.lastry.fr/healthz
curl -fsSI https://reactquest.lastry.fr/ | grep -Ei '^(HTTP/|cross-origin-opener-policy:|cross-origin-embedder-policy:)'
```

Les deux endpoints de sante doivent retourner `healthy`, l'etat Docker doit etre
`healthy`, et la reponse publique doit contenir COOP `same-origin` et COEP
`require-corp`. Dans un navigateur Chromium, verifier aussi :

```js
window.crossOriginIsolated === true;
```

## Exploitation

Afficher les logs applicatifs des 200 dernieres lignes, puis les suivre :

```bash
cd /opt/komodo/stacks/reactquest
export CADDY_NETWORK=caddy
docker compose logs --tail=200 reactquest
docker compose logs --follow reactquest
```

Reconstruire depuis la branche `main` et deployer la nouvelle revision :

```bash
cd /opt/komodo/stacks/reactquest
export CADDY_NETWORK=caddy
export REACTQUEST_IMAGE=reactquest:latest
sudo install -d -m 0755 /opt/komodo/state
git rev-parse HEAD | sudo tee /opt/komodo/state/reactquest.last-good >/dev/null
git switch main
git pull --ff-only origin main
docker compose config --quiet
docker compose build --pull --no-cache reactquest
docker compose up -d --remove-orphans
docker compose ps
```

Redeployer l'image et la revision deja presentes, sans reconstruire :

```bash
cd /opt/komodo/stacks/reactquest
export CADDY_NETWORK=caddy
export REACTQUEST_IMAGE=reactquest:latest
docker compose up -d --force-recreate --no-deps reactquest
docker compose ps
```

Revenir exactement a la revision enregistree avant le dernier rebuild :

```bash
cd /opt/komodo/stacks/reactquest
export CADDY_NETWORK=caddy
export REACTQUEST_IMAGE=reactquest:latest
git fetch origin main
git checkout --detach "$(cat /opt/komodo/state/reactquest.last-good)"
docker compose build --pull --no-cache reactquest
docker compose up -d --remove-orphans
docker compose ps
curl -fsS https://reactquest.lastry.fr/healthz
```

Le rollback laisse volontairement le checkout en mode detache afin que Komodo ne
le confonde pas avec la tete de `main`. Le prochain deploiement normal commence
par `git switch main` et `git pull --ff-only origin main`.

## Strategie 404

nginx sert les fichiers et repertoires prerendus par Astro, puis tente une forme
`<route>.html`. Une URL inconnue retourne le document statique `deploy/404.html`
avec le statut HTTP 404. Il n'y a pas de fallback aveugle vers `index.html`, car
React Quest produit actuellement des routes statiques et un tel fallback
transformerait les liens casses en faux succes HTTP 200.
