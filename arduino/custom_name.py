Import("env")

board_config = env.BoardConfig()
# should be array of VID:PID pairs
#board_config.update("build.hwids", [
#  ["0x2341", "0x0243"],  # 1st pair
#  ["0x2A03", "0x0043"].  # 2nd pair, etc.
#])
board_config.update("build.usb_product", "Nipplio Hardware Board")