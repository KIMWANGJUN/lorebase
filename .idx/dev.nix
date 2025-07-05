{ pkgs, ... }: {
  channel = "stable-24.11";
  
  packages = [
    pkgs.nodejs_20
  ];
  
  env = {
    NEXT_PUBLIC_ENVIRONMENT = "development";
  };
  
  idx = {
    previews = {
      enable = true;
      previews = {
              web = {
          command = ["npm" "run" "dev"];
          manager = "web";
          env = {
            PORT = "9002";
            HOSTNAME = "0.0.0.0";
          };
        };
      };
    };
  };
}
