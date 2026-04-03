# Funcionalidades YouTube - Music Player

## Novas Funcionalidades Implementadas

### 1. Busca no YouTube
- **Arquivo**: `src/screens/YouTubeSearchScreen.tsx`
- **Descrição**: Interface de busca integrada para procurar vídeos no YouTube
- **Recursos**:
  - Busca em tempo real com sugestões
  - Exibição de miniatura, duração e visualizações
  - Integração com a API Piped (sem anúncios, sem rastreamento do Google)

### 2. Extração de Áudio
- **Arquivo**: `src/services/YouTubeService.ts`
- **Descrição**: Serviço para extrair streams de áudio de vídeos do YouTube
- **Recursos**:
  - Busca de vídeos via API Piped
  - Extração automática de URL de áudio em melhor qualidade
  - Conversão de vídeos do YouTube para tracks reproduzíveis
  - Sem necessidade de download prévio

### 3. Reprodução em Segundo Plano
- **Arquivo**: `src/hooks/useTrackPlayer.ts`
- **Descrição**: Configuração para reprodução com tela bloqueada
- **Recursos**:
  - Reprodução contínua mesmo com tela desligada
  - Controles de mídia na tela de bloqueio
  - Notificações de reprodução
  - Suporte a comandos de fone de ouvido

### 4. Sem Anúncios
- **Tecnologia**: API Piped
- **Descrição**: Todos os vídeos do YouTube são reproduzidos sem anúncios
- **Benefícios**:
  - Experiência de usuário melhorada
  - Menor consumo de dados
  - Sem rastreamento do Google
  - Privacidade garantida

## Como Usar

### Buscar e Reproduzir Vídeos do YouTube

1. Abra o app e navegue até a aba "YouTube"
2. Digite o nome da música ou artista na barra de busca
3. Pressione Enter ou toque no ícone de busca
4. Toque em um vídeo para reproduzir
5. O áudio será extraído automaticamente e reproduzido

### Reproduzir com Tela Bloqueada

1. Comece a reproduzir uma música
2. Bloqueie a tela do celular
3. A reprodução continuará normalmente
4. Use os controles na tela de bloqueio para pausar/avançar

### Controles Disponíveis

- **Play/Pause**: Toque no botão de reprodução
- **Próxima**: Deslize para a direita ou use o botão de próxima
- **Anterior**: Deslize para a esquerda ou use o botão de anterior
- **Volume**: Use os botões de volume do celular

## Configurações de Permissões (Android)

As seguintes permissões foram adicionadas ao `AndroidManifest.xml`:

- `INTERNET`: Para acessar a API do YouTube/Piped
- `FOREGROUND_SERVICE`: Para reprodução em segundo plano
- `FOREGROUND_SERVICE_MEDIA_PLAYBACK`: Para controle de mídia
- `WAKE_LOCK`: Para manter o dispositivo ativo durante reprodução

## Arquitetura

### YouTubeService.ts
```typescript
- searchYouTube(query): Busca vídeos no YouTube via Piped API
- getYouTubeAudioUrl(videoId): Extrai URL de áudio em melhor qualidade
- convertYouTubeToTrack(video): Converte vídeo para formato Track
- getYouTubeTrack(video): Obtém track completo com URL de áudio
```

### YouTubeSearchScreen.tsx
```typescript
- Componente React Native com interface de busca
- Integração com YouTubeService
- Exibição de resultados com miniaturas
- Reprodução direta ao tocar em um vídeo
```

### Reprodução em Segundo Plano
```typescript
- alwaysPauseOnInterruption: false (continua mesmo com interrupções)
- progressUpdateEventInterval: 1000 (atualiza a cada segundo)
- Suporte a controles de mídia do sistema
```

## Notas Importantes

1. **API Piped**: A busca utiliza a instância pública do Piped em `https://pipedapi.kavin.rocks`
2. **Qualidade de Áudio**: O serviço seleciona automaticamente o stream de áudio com melhor bitrate
3. **Sem Cache Local**: Os vídeos são reproduzidos em streaming, não são baixados
4. **Compatibilidade**: Funciona em Android 5.0+ e iOS 12+

## Troubleshooting

### Vídeo não reproduz
- Verifique a conexão com a internet
- Tente buscar outro vídeo
- Reinicie o app

### Áudio com qualidade ruim
- Verifique sua conexão de internet
- O Piped seleciona a melhor qualidade disponível

### Reprodução não continua com tela bloqueada
- Verifique se as permissões foram concedidas
- Reinicie o app
- Verifique as configurações de bateria do dispositivo

## Futuras Melhorias

- [ ] Cache de streams para reprodução offline
- [ ] Playlist do YouTube
- [ ] Sincronização com histórico do YouTube
- [ ] Suporte a múltiplas instâncias do Piped
- [ ] Download de áudio para reprodução offline
